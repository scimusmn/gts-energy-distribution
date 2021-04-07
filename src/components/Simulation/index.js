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
import {
  AverageArray, Map, Clamp, SecsToTimeString,
} from '../../utils';

class Simulation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arduinoIsAwake: false,
      currentView: '',
      messageCenter: {},
      production: 0,
      demand: 0,
      efficiency: 0,
      day: '',
      time: 0,
      hourIndex: 0,
      energyData: {},
      finalScore: 0,
      wind: 0,
      temp: 0,
      condition: '',
      blackout: false,
      finalFeedback: null,
    };

    this.onData = this.onData.bind(this);
    this.onStartButton = this.onStartButton.bind(this);
    this.queueMessage = this.queueMessage.bind(this);
    this.releaseQueue = this.releaseQueue.bind(this);
    this.getCurrentProduction = this.getCurrentProduction.bind(this);

    this.liveData = {};
    this.sessionData = {};
    this.hourlyInterval = {};

    this.interruptInterval = {};
    this.messageQueue = {};
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);

    const wakeInterval = setInterval(() => {
      const { arduinoIsAwake } = this.state;
      if (arduinoIsAwake) {
        this.reset();

        // This timed release of outgoing
        // Arduino messages ensures
        // the Arduino NeoPixel library
        // has enough time to execute it's
        // 'show' method that can corrupt
        // incoming serial data - tn, 2021
        this.interruptInterval = setInterval(() => {
          this.releaseQueue();
        }, 60);
        clearInterval(wakeInterval);
      } else {
        // Wake up the Arduino
        this.queueMessage('wake-arduino', '1');
        this.releaseQueue();
        console.log('Arduino not yet awake...');
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interruptInterval);
  }

  onData(data) {
    console.log('onData:', data);

    const message = Object.keys(data)[0];
    const value = Object.values(data)[0];

    if (message === 'arduino-ready') {
      console.log('Arduino is ready!');
      this.setState({ arduinoIsAwake: true });
      return;
    }

    this.liveData[message] = value;

    if (message === 'start-button' && parseInt(value, 2) === 1) {
      this.onStartButton();
      return;
    }

    // Catch coal switches. They don't immediately affect
    // current value, which we add to the liveData object.
    if (message.startsWith('coal-') && message.endsWith('-switch')) {
      const panelId = message.substring(5, 6);
      const stateKey = `coal-${panelId}-state`;

      // Switch turned off. No delay necessary.
      if (value === 0) {
        this.queueMessage(`coal-${panelId}-light`, 'off');
        this.liveData[stateKey] = 'off';
        const wtKey = `coal-${panelId}-warming-ticks`;
        this.liveData[wtKey] = 0;
        return;
      }

      // Switch turned on. Go into warming mode.
      if (value === 1) {
        this.queueMessage(`coal-${panelId}-light`, 'warming');
        this.liveData[stateKey] = 'warming';
        return;
      }
    }

    // Catch gas arrow buttons exceptions. These messages
    // don't provide the current value, but are used to adjust the
    // current value, which we add to the liveData object.
    if (message.startsWith('gas-') && message.includes('-button-')) {
      const panelId = message.substring(4, 5);
      const levelKey = `gas-${panelId}-level`;
      let currentLevel = this.liveData[levelKey];
      if (!currentLevel) currentLevel = 0.0;

      let adjustment = Settings.GAS_ARROW_POWER;
      // Increment if up arrow was pressed,
      // decrement if down arrow was pressed
      if (message.endsWith('-down')) adjustment *= -1;
      let controlLevel = currentLevel + adjustment;
      // Clamp to 0–100;
      controlLevel = Clamp(controlLevel, 0, 100);
      this.liveData[levelKey] = controlLevel;

      // Immediately echo back gas light bar message
      this.queueMessage(`gas-${panelId}-light-bar`, controlLevel);

      return;
    }

    // Immediately echo back hydro light bar messages
    if (message.startsWith('hydro-') && message.endsWith('-lever')) {
      const panelId = message.substring(6, 7);
      this.queueMessage(`hydro-${panelId}-light-bar`, value);
    }
  }

  onStartButton() {
    console.log('onStartButton()');

    const { currentView } = this.state;

    if (currentView === 'ready') {
      // Stop flashing start button
      this.queueMessage('start-button-light', '0');
      this.setState({ currentView: '' });
      this.startSimulation();
    } else if (currentView === 'score') {
      this.reset();
    }
  }

  getCurrentProduction(hourProgress) {
    // Get ACTIVE panels (by checking jack state)
    const entries = Object.entries(this.liveData);
    const activePanels = {
      coal: [], gas: [], hydro: [], solar: [], wind: [],
    };
    for (let i = 0; i < entries.length; i += 1) {
      const [key, value] = entries[i];
      if (key.endsWith('-jack') && value === 1) {
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
        const wtKey = `coal-${panelId}-warming-ticks`;
        const warmingTicks = this.liveData[wtKey] || 0;
        if (warmingTicks > Settings.COAL_WARMING_DELAY) {
          this.liveData[stateKey] = 'on';
          outputLevel = 1.0;
          this.liveData[wtKey] = 0;
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
    const solarAvailability = DataManager.getSolarAvailability(hourIndex, hourProgress);
    const numSolarPanels = activePanels.solar.length;
    const solarProduction = numSolarPanels * solarAvailability * Settings.MAX_OUTPUT_PER_PANEL;

    // WIND production
    const windAvailability = DataManager.getWindAvailability(hourIndex, hourProgress);
    const numWindPanels = activePanels.wind.length;
    const windProduction = numWindPanels * windAvailability * Settings.MAX_OUTPUT_PER_PANEL;

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

  reset() {
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
      timestamps: [],
    };
    clearInterval(this.hourlyInterval);

    // Prepare next weather forecast
    // Select forecast data for this session
    DataManager.selectNewForecast();
    this.setState({
      hourIndex: 0,
      // forecast: DataManager.getForecastSummary(),
      currentView: 'ready',
      blackout: false,
    });

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

      this.sessionData.timestamps.push(Date.now());

      if (hourIndex >= totalHoursInSession) {
        this.endSimulation();
      } else {
        const productionSnapshot = this.getCurrentProduction(1.0);
        const production = productionSnapshot.total;

        // Add live production snapshot to production history
        Object.entries(productionSnapshot).forEach((entry) => {
          const [key, value] = entry;
          this.sessionData.energy[key].push(value);
        });

        const demand = DataManager.getDemand(hourIndex);

        // Calculate efficiency score
        const difference = demand - production;
        const efficiency = Simulation.calculateEfficiency(difference);
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
          time: DataManager.getFieldAtHour(hourIndex, 'TimeNum'),
          day: DataManager.getFieldAtHour(hourIndex, 'Day'),
          hourIndex: hourIndex + 1,
          energyData: this.sessionData.energy,
          wind: DataManager.getFieldAtHour(hourIndex, 'WindSpeedNum'),
          temp: DataManager.getFieldAtHour(hourIndex, 'TemperatureNum'),
          condition: DataManager.getFieldAtHour(hourIndex, 'Condition'),
        });
      }
    }, hourInterval);

    // TODO: Replace with reqAnimationFrame HOC
    this.interpInterval = setInterval(() => {
      const { hourIndex } = this.state;
      if (hourIndex <= 0 || hourIndex >= totalHoursInSession) return;

      const { timestamps } = this.sessionData;
      const prevTimestamp = timestamps[timestamps.length - 1];
      const nowTimestamp = Date.now();
      const hourProgress = (nowTimestamp - prevTimestamp) / hourInterval;

      // Demand
      const demand = DataManager.interpolate(hourIndex, hourProgress, 'Demand');

      // Production
      const productionSnapshot = this.getCurrentProduction(hourProgress);
      const production = productionSnapshot.total;
      // TODO: Update live chart here.

      // Efficiency
      const difference = demand - production;
      const efficiency = Simulation.calculateEfficiency(difference);

      const time = DataManager.interpolate(hourIndex, hourProgress, 'TimeNum');
      const temp = Math.round(DataManager.interpolate(hourIndex, hourProgress, 'TemperatureNum'));
      const wind = Math.round(DataManager.interpolate(hourIndex, hourProgress, 'WindSpeedNum'));

      this.setState({
        time,
        demand,
        production,
        efficiency,
        temp,
        wind,
      });
    }, 150);
  }

  endSimulation() {
    // Stop all timers
    clearInterval(this.hourlyInterval);
    clearInterval(this.interpInterval);

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
        sendData(`{${key}:${value}}`);
      }

      console.log('release size:', messageObjects.length);
      console.log('releaseQueue:', this.messageQueue);

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
      day,
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
              <h2>
                {day}
                {' '}
                |
                {' '}
                <strong>{SecsToTimeString(time)}</strong>
              </h2>
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
              <h2>{`${temp} F`}</h2>
            </Col>
            <Col>
              <p>Wind</p>
              <h2>{`${wind} MPH`}</h2>
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
          ready: <ReadyScreen key="ready" />,
          score: <ScoreScreen key="score" feedbackMessage={finalFeedback} efficiencyScore={finalScore} chartData={energyData} customerFeedback={this.sessionData.feedback} />,
        }[currentView]}
      </div>
    );
  }
}

Simulation.calculateEfficiency = (difference) => {
  let efficiency = difference * Settings.EFFICIENCY_SCORE_MULTIPLIER;
  efficiency = Math.abs(efficiency); // Distance from 0
  efficiency = Map(efficiency, 0, Settings.MAX_EXPECTED_DEMAND, 1, 0); // Map to 0–1
  efficiency = Clamp(efficiency, 0, 1); // Clamp between 0–1
  return efficiency;
};

Simulation.propTypes = {
  sendData: PropTypes.func.isRequired,
  setOnDataCallback: PropTypes.func.isRequired,
};

const SimulationWithSerialCommunication = withSerialCommunication(Simulation);

export default SimulationWithSerialCommunication;
