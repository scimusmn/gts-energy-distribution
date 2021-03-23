/* eslint no-console: 0 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'reactstrap';
import GaugeChart from 'react-gauge-chart';
import withSerialCommunication from '../../Arduino/arduino-base/ReactSerial/SerialHOC';
import ArduinoEmulator from '../ArduinoEmulator';
import DataManager from '../../data/data-manager';
import Settings from '../../data/settings';
import EnergyChart from '../EnergyChart';
import PowerMeter from '../PowerMeter';
import MessageCenter from '../MessageCenter';
import ScoreScreen from '../ScoreScreen';
import ReadyScreen from '../ReadyScreen';
import ConditionIcon from '../Forecast/condition-icon';
import { AverageArray, Map, Clamp } from '../../utils';

class Simulation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentView: '',
      forecast: [],
      messageCenter: {},
      production: 0,
      demand: 0,
      efficiency: 0,
      time: '0:00',
      hourIndex: 0,
      energyData: {},
      finalScore: 0,
      wind: '',
      temp: '',
      condition: '',
      blackout: false,
      finalFeedback: null,
      boardEnabled: true,
    };

    this.onData = this.onData.bind(this);
    this.onStartButton = this.onStartButton.bind(this);
    this.queueMessage = this.queueMessage.bind(this);
    this.releaseQueue = this.releaseQueue.bind(this);
    this.getCurrentProduction = this.getCurrentProduction.bind(this);

    this.liveData = {};
    this.sessionData = {};
    this.hourlyInterval = {};
    this.messageQueue = {};
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);

    // This timed release of outgoing
    // Arduino messages ensures
    // the Arduino NeoPixel library
    // has enough time to execute it's
    // 'show' method that can corrupt
    // incoming serial data - tn, 2021
    this.interruptInterval = setInterval(() => {
      this.releaseQueue();
    }, 60);

    // TODO: Something is goofy with the
    // initial start-light message not working.
    setTimeout(() => {
      this.queueMessage('wake-arduino', '1');
      setTimeout(() => {
        this.reset();
      }, 150);
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interruptInterval);
  }

  onData(data) {
    console.log('onData:', data);

    const message = Object.keys(data)[0];
    const value = Object.values(data)[0];

    this.liveData[message] = value;

    if (message === 'start-button' && value === '1') {
      this.onStartButton();
      return;
    }

    const { boardEnabled } = this.state;
    if (!boardEnabled) return;

    if (message.endsWith('-jack')) {
      this.onJackChange(message, value);
      return;
    }

    if (message.startsWith('hydro-')) {
      this.onHydroChange(message, value);
    }

    if (message.startsWith('gas-')) {
      this.onGasChange(message);
      return;
    }

    if (message.startsWith('coal-')) {
      this.onCoalChange(message, value);
    }
  }

  onJackChange(message, value) {
    // Any time a jack is unplugged, zero the associated light bar
    if (value === '1') {
      const panelId = message.split('-jack')[0];
      this.queueMessage(`${panelId}-light-bar`, 0);

      // Certain energy types resest when unplugged
      if (message.startsWith('gas-')) this.liveData[`${panelId}-level`] = 0;
      if (message.startsWith('coal-')) this.queueMessage(`${panelId}-light`, 'off');

      return;
    }

    // Certain energy types must be updated when plugged in
    if (value === '0') {
      const panelId = message.split('-jack')[0];
      if (message.startsWith('coal-')) {
        const prevState = this.liveData[`${panelId}-state`];
        if (prevState === 'on' || prevState === 'warming') {
          this.liveData[`${panelId}-state`] = 'warming';
          this.liveData[`${panelId}-warming-ticks`] = 0;
          this.queueMessage(`${panelId}-light`, 'warming');
        }
        return;
      }
      if (message.startsWith('hydro-')) {
        const prevLightBar = this.liveData[`${panelId}-light-bar`];
        this.queueMessage(`${panelId}-light-bar`, prevLightBar);
      }
    }
  }

  onHydroChange(message, value) {
    // Echo back hydro light bar messages
    if (message.endsWith('-lever')) {
      const panelId = message.split('-lever')[0];
      const isPluggedIn = (this.liveData[`${panelId}-jack`] === '0');
      if (isPluggedIn) {
        this.queueMessage(`${panelId}-light-bar`, value);
      }
    }
  }

  onGasChange(message) {
    if (message.includes('-button-')) {
      const panelId = message.split('-button-')[0];
      const isPluggedIn = (this.liveData[`${panelId}-jack`] === '0');
      if (isPluggedIn) {
        const levelKey = `${panelId}-level`;
        let currentLevel = this.liveData[levelKey];
        if (!currentLevel) currentLevel = 0.0;

        // Increment if up was pressed,
        // decrement if down was pressed
        let adjustment = Settings.GAS_ARROW_POWER;
        if (message.endsWith('-down')) adjustment *= -1;
        let controlLevel = currentLevel + adjustment;
        // Clamp to 0–100;
        controlLevel = Clamp(controlLevel, 0, 100);
        this.liveData[levelKey] = controlLevel;

        // Immediately echo back gas light bar message
        this.queueMessage(`${panelId}-light-bar`, controlLevel);
      }
    }
  }

  onCoalChange(message, value) {
    if (message.endsWith('-switch')) {
      const panelId = message.split('-switch')[0];
      const isPluggedIn = (this.liveData[`${panelId}-jack`] === '0');
      const stateKey = `${panelId}-state`;

      // Switch has turned off.
      if (value === '0') {
        this.liveData[stateKey] = 'off';
        this.liveData[`${panelId}-warming-ticks`] = 0;
        if (isPluggedIn) this.queueMessage(`${panelId}-light`, 'off');
        return;
      }

      // Switch has turned on. Go into warming mode.
      if (value === '1') {
        this.liveData[stateKey] = 'warming';
        if (isPluggedIn) this.queueMessage(`${panelId}-light`, 'warming');
      }
    }
  }

  onStartButton() {
    const { currentView } = this.state;

    if (currentView === 'ready') {
      this.queueMessage('start-button-light', '0');
      this.setState({ currentView: '' });
      this.startSimulation();
    } else if (currentView === 'score') {
      this.reset();
    }
  }

  getCurrentProduction() {
    // Calculate current production levels
    console.log('getCurrentProduction - ', this.liveData);

    // Get ACTIVE panels (by checking jack state)
    const entries = Object.entries(this.liveData);
    const activePanels = {
      coal: [], gas: [], hydro: [], solar: [], wind: [],
    };
    for (let i = 0; i < entries.length; i += 1) {
      const [key, value] = entries[i];
      if (key.endsWith('-jack') && parseInt(value, 2) === 0) {
        const split = key.split('-');
        const panelType = split[0];
        const panelId = `${split[0]}-${split[1]}`;
        if (!activePanels[panelType]) {
          console.log(`Warning - Unexpected panelType found: ${panelType}`);
          activePanels[panelType] = [];
        }
        activePanels[panelType].push(panelId);
      }
    }

    // Gather environmental variables that affect
    // production/energy availability
    const { hourIndex } = this.state;

    // COAL production
    let coalProduction = 0.0;
    for (let i = 0; i < activePanels.coal.length; i += 1) {
      const panelId = activePanels.coal[i];

      // Coal input level based on switch
      const stateKey = `${panelId}-state`;
      const coalState = this.liveData[stateKey] || 'off'; // ('off', 'warming', 'on')

      let outputLevel = 0;
      if (coalState === 'on') {
        outputLevel = 1.0;
      } else if (coalState === 'warming') {
        // Tick up warming counter.
        // After X ticks on warming, shift into 'on'
        const wtKey = `${panelId}-warming-ticks`;
        const warmingTicks = this.liveData[wtKey] || 0;
        if (warmingTicks > 6) {
          this.liveData[stateKey] = 'on';
          outputLevel = 1.0;
          this.liveData[wtKey] = 0;
          this.queueMessage(`${panelId}-light`, 'on');
        } else {
          this.liveData[wtKey] = warmingTicks + 1;
        }
      }

      const panelProduction = parseFloat(outputLevel) * Settings.MAX_OUTPUT_PER_PANEL;
      coalProduction += panelProduction;
    }

    // GAS production
    let gasProduction = 0.0;
    for (let i = 0; i < activePanels.gas.length; i += 1) {
      const panelId = activePanels.gas[i];

      // Gas input level (created from button presses)
      let controlLevel = this.liveData[`${panelId}-level`];
      if (!controlLevel) controlLevel = 0;

      const panelProduction = (parseFloat(controlLevel) / 100) * Settings.MAX_OUTPUT_PER_PANEL;
      gasProduction += panelProduction;
    }

    // HYDRO production
    let hydroProduction = 0.0;
    for (let i = 0; i < activePanels.hydro.length; i += 1) {
      const panelId = activePanels.hydro[i];

      // Hydro panel lever input
      let controlLevel = this.liveData[`${panelId}-lever`];
      if (!controlLevel) controlLevel = 0;
      const panelProduction = (parseFloat(controlLevel) / 100) * Settings.MAX_OUTPUT_PER_PANEL;
      hydroProduction += panelProduction;
    }

    // SOLAR production
    const solarAvailability = DataManager.getSolarAvailability(hourIndex);
    const numSolarPanels = activePanels.solar.length;
    const solarProduction = numSolarPanels * solarAvailability * Settings.MAX_OUTPUT_PER_PANEL;
    const solarLightBar = Math.ceil(solarAvailability * 100);
    for (let i = 0; i < numSolarPanels; i += 1) {
      this.queueMessage(`${activePanels.solar[i]}-light-bar`, solarLightBar);
    }

    // WIND production
    const windAvailability = DataManager.getWindAvailability(hourIndex);
    const numWindPanels = activePanels.wind.length;
    const windProduction = numWindPanels * windAvailability * Settings.MAX_OUTPUT_PER_PANEL;
    const windLightBar = Math.ceil(windAvailability * 100);
    for (let i = 0; i < numWindPanels; i += 1) {
      this.queueMessage(`${activePanels.wind[i]}-light-bar`, windLightBar);
    }

    // Snapshot
    const production = {
      coal: coalProduction,
      gas: gasProduction,
      hydro: hydroProduction,
      solar: solarProduction,
      wind: windProduction,
    };

    // Sum total of all production values
    let total = 0;
    Object.values(production).forEach((value) => {
      total += value;
    });
    production.total = total;

    // console.log('Production snapshot:');
    // console.log(production);

    return production;
  }

  disableControlBoard() {
    this.setState({ boardEnabled: false }, () => {
      this.zeroLightBars();
    });
  }

  enableControlBoard() {
    this.setState({ boardEnabled: true }, () => {
      this.queueMessage('get-all-states', '1');
    });
  }

  zeroLightBars() {
    const lightBarEnergyTypes = ['coal', 'gas', 'hydro', 'solar', 'wind'];
    const maxPanels = 6;
    for (let i = 0; i < lightBarEnergyTypes.length; i += 1) {
      for (let j = 0; j < maxPanels; j += 1) {
        const panelId = `${lightBarEnergyTypes[i]}-${j + 1}`;
        if (lightBarEnergyTypes[i] === 'coal') {
          this.queueMessage(`${panelId}-light`, 'off');
        } else {
          this.queueMessage(`${panelId}-light-bar`, 0);
        }
      }
    }
  }

  reset() {
    clearInterval(this.hourlyInterval);

    this.liveData = {};
    const energy = {
      coal: [],
      gas: [],
      hydro: [],
      solar: [],
      wind: [],
      demand: [],
      total: [],
    };
    this.sessionData = {
      energy,
      feedback: [],
      efficiency: [],
    };

    // Prepare next weather forecast
    // Select forecast data for this session
    DataManager.selectNewForecast();
    this.setState({
      hourIndex: 0,
      forecast: DataManager.getForecastSummary(),
      currentView: 'ready',
      blackout: false,
    });

    this.enableControlBoard();

    // Flash start button
    this.queueMessage('start-button-light', '1');
  }

  startSimulation() {
    // Get all starting states from Arduino
    this.queueMessage('get-all-states', '1');

    const dayInterval = Settings.SESSION_DURATION / Settings.DAYS_PER_SESSION;
    const hourInterval = Math.ceil(dayInterval / 24);
    const totalHoursInSession = 24 * Settings.DAYS_PER_SESSION;

    // Pre-populate chart with demand.
    this.sessionData.energy.demand = DataManager.getCurrentForecastField('Demand');
    this.sessionData.energy.timeLabels = DataManager.getCurrentForecastField('Time');
    this.setState({ energyData: this.sessionData.energy });

    this.hourlyInterval = setInterval(() => {
      const { hourIndex } = this.state;

      if (hourIndex >= totalHoursInSession) {
        this.endSimulation();
      } else {
        const productionSnapshot = this.getCurrentProduction();
        const production = productionSnapshot.total;

        // Add live production snapshot to production history
        Object.entries(productionSnapshot).forEach((entry) => {
          const [key, value] = entry;
          this.sessionData.energy[key].push(value);
        });

        const demand = DataManager.getDemand(hourIndex);

        // Calculate efficiency score
        const difference = (demand - production);

        let efficiency = difference * Settings.EFFICIENCY_SCORE_MULTIPLIER;

        // Convert difference to 0–1 percentage score
        efficiency = Math.abs(efficiency); // Distance from 0
        efficiency = Map(efficiency, 0, Settings.MAX_EXPECTED_DEMAND, 1, 0); // Map to 0–1
        efficiency = Clamp(efficiency, 0, 1); // Clamp between 0–1
        this.sessionData.efficiency.push(efficiency);

        // Check for Message Center triggers
        const polarity = Math.sign(difference);
        const triggeredMessage = DataManager.checkMessageCenterTriggers(efficiency, polarity);

        let { messageCenter } = this.state;
        // Remember all triggered message centers for score screen
        if (triggeredMessage) {
          this.sessionData.feedback.push(triggeredMessage);
          if (triggeredMessage.Trigger === 'FEEDBACK_BLACKOUT') {
            this.setState({
              blackout: true,
              finalFeedback: triggeredMessage.Body,
            });
            clearInterval(this.hourlyInterval);
            setTimeout(() => {
              this.endSimulation();
            }, 2750);
          } else {
            messageCenter = triggeredMessage;
          }
        }

        this.setState({
          production,
          demand,
          efficiency,
          messageCenter,
          time: DataManager.getTime(hourIndex),
          hourIndex: hourIndex + 1,
          energyData: this.sessionData.energy,
          wind: DataManager.getFieldAtHour(hourIndex, 'WindSpeed'),
          temp: DataManager.getFieldAtHour(hourIndex, 'Temperature'),
          condition: DataManager.getFieldAtHour(hourIndex, 'Condition'),
        });
      }
    }, hourInterval);
  }

  endSimulation() {
    // Stop all timers
    clearInterval(this.hourlyInterval);

    this.disableControlBoard();

    // Calculate final scores and feedback
    const finalScore = AverageArray(this.sessionData.efficiency);
    const sessionFeedback = DataManager.getSessionFeedback(this.sessionData);

    // Display score screen
    this.setState(
      {
        finalScore,
        finalFeedback: sessionFeedback.Body,
        currentView: 'score',
      },
    );

    // Flash start button
    this.queueMessage('start-button-light', '1');
  }

  queueMessage(message, value) {
    // Set latest data using message as key
    // This will intentionally overwrite any data
    // that has not already been output with same key
    this.messageQueue[message] = value;
  }

  releaseQueue() {
    const { sendData } = this.props;
    const messageObjects = Object.entries(this.messageQueue);

    if (messageObjects.length > 0) {
      // Send all queued messages
      for (let i = 0; i < messageObjects.length; i += 1) {
        const [key, value] = messageObjects[i];
        console.log(`sendData: {${key}:${value}}`); // TEMP: Remove for production.
        sendData(`{${key}:${value}}`);
      }

      // Clear the message queue so we don't
      // make uneccessary updates.
      this.messageQueue = {};

      // After sending all queued messages (including light bar updates),
      // publish them by following a the neopixel show command
      sendData('{neopixels-show:1}');
    }
  }

  render() {
    const {
      currentView,
      time,
      forecast,
      messageCenter,
      production,
      demand,
      efficiency,
      energyData,
      finalScore,
      wind,
      temp,
      condition,
      blackout,
      finalFeedback,
    } = this.state;

    return (
      <div className="simulation">
        <ArduinoEmulator onChange={this.onData} />
        <Container className="forecast window" style={{ display: 'none' }}>
          <EnergyChart
            chartData={energyData}
            yAxisMax={Settings.MAX_EXPECTED_DEMAND}
            isLive
          />
        </Container>
        <MessageCenter time={time} message={messageCenter} />
        <Container className="current-conditions window">
          <Row>
            <Col>
              <h2>Current conditions</h2>
            </Col>
            <Col className="text-center text-md-right">
              <h1><strong>{time}</strong></h1>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col>
              <p>Condition</p>
              <h2>
                {condition}
              </h2>
            </Col>
            <Col className="text-left text-md-left">
              <ConditionIcon condition={condition} pixelSize={128} />
            </Col>
            <Col>
              <p>Temp</p>
              <h2>{temp}</h2>
            </Col>
            <Col>
              <p>Wind</p>
              <h2>{wind}</h2>
            </Col>
          </Row>
        </Container>
        <Container className="power-levels window">
          <Row>
            <PowerMeter label="Production" color="green" level={production} maxlevel={Settings.MAX_EXPECTED_DEMAND} barheight={500} />
            <PowerMeter label="Demand" color="orange" level={demand} maxlevel={Settings.MAX_EXPECTED_DEMAND} barheight={500} />
          </Row>
          <br />
          <Row>
            <Col style={{ textAlign: 'center' }}>
              <GaugeChart
                id="gauge-efficiency"
                percent={efficiency}
                colors={['#EA4228', '#F5CD19', '#5BE12C']}
                animDelay={0}
                hideText
              />
              <h3>
                Efficiency
                {' '}
              </h3>
              <h1>
                {Math.ceil(efficiency * 100)}
                %
              </h1>
            </Col>
          </Row>
        </Container>
        <div className={`blackout ${blackout ? 'show' : ''}`} />
        {{
          ready: <ReadyScreen key="ready" forecast={forecast} />,
          score: <ScoreScreen key="score" feedbackMessage={finalFeedback} efficiencyScore={finalScore} chartData={energyData} customerFeedback={this.sessionData.feedback} />,
        }[currentView]}
      </div>
    );
  }
}

Simulation.propTypes = {
  sendData: PropTypes.func.isRequired,
  setOnDataCallback: PropTypes.func.isRequired,
};

const SimulationWithSerialCommunication = withSerialCommunication(Simulation);

export default SimulationWithSerialCommunication;
