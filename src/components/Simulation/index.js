/* eslint no-console: 0 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'reactstrap';
import GaugeChart from 'react-gauge-chart';
import withSerialCommunication from '../../Arduino/arduino-base/ReactSerial/SerialHOC';
import ArduinoEmulator from '../ArduinoEmulator';
import DayCycle from '../DayCycle';
import DataManager from '../../data/data-manager';
import Settings from '../../data/settings';
import PowerMeter from '../PowerMeter';
import MeterDiff from '../MeterDiff';
import MessageCenter from '../MessageCenter';
import AttractScreen from '../AttractScreen';
import ScoreScreen from '../ScoreScreen';
import ReadyScreen from '../ReadyScreen';
import {
  AverageArray, Map, Clamp, NearestTimeInterval,
} from '../../utils';

class Simulation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arduinoIsAwake: false,
      currentView: 'ready',
      currentSlide: 1,
      messageCenter: {},
      production: 0,
      demand: 0,
      efficiency: 0,
      time: 0,
      hourIndex: 0,
      energyData: {},
      finalScore: 0,
      wind: 0,
      solarAvailability: 0,
      blackout: false,
      finalFeedback: null,
      boardEnabled: true,
      inSession: false,
      attractMode: true,
      hourInterval: 0,
      totalHoursInSession: 0,
    };

    this.onData = this.onData.bind(this);
    this.onStartButton = this.onStartButton.bind(this);
    this.queueMessage = this.queueMessage.bind(this);
    this.releaseQueue = this.releaseQueue.bind(this);
    this.getCurrentProduction = this.getCurrentProduction.bind(this);
    this.onActivity = this.onActivity.bind(this);

    this.liveData = {};
    this.sessionData = {};
    this.hourlyInterval = {};

    this.interruptInterval = {};
    this.messageQueue = {};

    this.inactivityTimeout = {};
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);

    const wakeInterval = setInterval(() => {
      const { arduinoIsAwake } = this.state;
      if (arduinoIsAwake || !Settings.REQUIRE_ARDUINO_CONNECTION) {
        this.reset();

        // Timed release of outgoing
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
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interruptInterval);
  }

  onData(data) {
    // console.log('onData:', data);

    const message = Object.keys(data)[0];
    const value = Object.values(data)[0];

    if (message === 'arduino-ready') {
      console.log('Arduino is ready!');
      this.setState({ arduinoIsAwake: true });
      return;
    }

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
    // Any time a jack is unplugged, zero associated light bar
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
        const prevSwitchState = this.liveData[`${panelId}-switch`];
        if (prevSwitchState) this.onCoalChange(`${panelId}-switch`, prevSwitchState);
        return;
      }
      // Update hydro bar to show last value
      if (message.startsWith('hydro-')) {
        const prevLeverValue = this.liveData[`${panelId}-lever`];
        if (prevLeverValue) this.onHydroChange(`${panelId}-lever`, prevLeverValue);
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
        this.liveData[`${panelId}-warming-ticks`] = 0;
        this.liveData[stateKey] = 'warming';
        if (isPluggedIn) this.queueMessage(`${panelId}-light`, 'warming');
      }
    }
  }

  onActivity() {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => {
      const { currentView } = this.state;
      if (currentView !== '') {
        window.location.reload();
      } else {
        this.onActivity();
      }
    }, Settings.INACTIVITY_TIMEOUT_SECS * 1000);
  }

  onStartButton() {
    const { currentView, attractMode } = this.state;

    // Reset inactivity timer
    this.onActivity();

    if (attractMode) {
      this.reset();
      this.setState({ attractMode: false });
      return;
    }

    if (currentView === 'ready') {
      const { currentSlide } = this.state;
      if (currentSlide >= 4) {
        this.queueMessage('start-button-light', '0');
        this.setState({ currentView: '' });
        this.startSimulation();
      } else {
        this.setState({ currentSlide: currentSlide + 1 });
      }
    } else if (currentView === 'score') {
      const { currentSlide } = this.state;
      if (currentSlide >= 3) {
        this.reset();
      } else {
        this.setState({ currentSlide: currentSlide + 1 });
      }
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
      } else if (coalState === 'warming' && hourProgress === 1) {
        // Tick up warming counter.
        // After X ticks on warming, shift into 'on'
        const wtKey = `${panelId}-warming-ticks`;
        const warmingTicks = this.liveData[wtKey] || 0;
        if (warmingTicks >= Settings.COAL_WARMING_DELAY) {
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
    const solarAvailability = DataManager.getSolarAvailability(hourIndex, hourProgress);
    const numSolarPanels = activePanels.solar.length;
    const solarProduction = numSolarPanels * solarAvailability * Settings.MAX_OUTPUT_PER_PANEL;
    const solarLightBar = Math.ceil(solarAvailability * 100);
    for (let i = 0; i < numSolarPanels; i += 1) {
      this.queueMessage(`${activePanels.solar[i]}-light-bar`, solarLightBar);
    }

    // WIND production
    const windAvailability = DataManager.getWindAvailability(hourIndex, hourProgress);
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

  maximizeWarmingTicks() {
    for (let j = 0; j < 5; j += 1) {
      const panelId = `coal-${j + 1}`;
      const isPluggedIn = (this.liveData[`${panelId}-jack`] === '0');
      const isSwitchedOn = (this.liveData[`${panelId}-switch`] === '1');

      if (isPluggedIn && isSwitchedOn) {
        this.liveData[`${panelId}-state`] = 'on';
        this.liveData[`${panelId}-warming-ticks`] = 0;
        this.queueMessage(`${panelId}-light`, 'on');
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
      timestamps: [],
    };

    // Prepare next weather forecast
    // Select forecast data for this session
    DataManager.selectNewForecast();
    this.setState({
      hourIndex: 0,
      currentView: 'ready',
      time: DataManager.getFieldAtHour(0, 'TimeNum'),
      currentSlide: 1,
      blackout: false,
      production: 0,
      demand: 0,
    });

    this.enableControlBoard();

    // Flash start button
    this.queueMessage('start-button-light', '1');
  }

  startSimulation() {
    // Get all starting states from Arduino
    this.queueMessage('get-all-states', '1');

    // Allow player to start with running coal power
    setTimeout(() => {
      this.maximizeWarmingTicks();
    }, 750);

    const dayInterval = Settings.SESSION_DURATION / Settings.DAYS_PER_SESSION;
    const hourInterval = Math.ceil(dayInterval / 24);
    const totalHoursInSession = 24 * Settings.DAYS_PER_SESSION;

    // Pre-populate chart with demand.
    this.sessionData.energy.demand = DataManager.getCurrentForecastField('Demand');
    this.sessionData.energy.timeLabels = DataManager.getCurrentForecastField('Time');
    this.setState({
      energyData: this.sessionData.energy, inSession: true, hourInterval, totalHoursInSession,
    });

    this.hourlyInterval = setInterval(() => {
      this.processSimulationHour();
    }, hourInterval);

    // This interval triggers the updates in between simulation hours,
    // interpolating between the previous and upcoming hourly data points
    this.interpInterval = setInterval(() => {
      this.interpolateSimulationState();
    }, 150);
  }

  processSimulationHour() {
    const { hourIndex, totalHoursInSession } = this.state;

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
        hourIndex: hourIndex + 1,
        energyData: this.sessionData.energy,
        wind: DataManager.getFieldAtHour(hourIndex, 'WindSpeedNum'),
      });
    }
  }

  interpolateSimulationState() {
    const { hourIndex, hourInterval, totalHoursInSession } = this.state;
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

    // Efficiency
    const difference = demand - production;
    const efficiency = Simulation.calculateEfficiency(difference);

    const wind = Math.round(DataManager.interpolate(hourIndex, hourProgress, 'WindSpeedNum'));

    const time = DataManager.timeInterpolate(hourIndex, hourProgress, 'TimeNum');

    this.setState({
      time,
      demand,
      production,
      efficiency,
      wind,
      solarAvailability: DataManager.getSolarAvailability(hourIndex, hourProgress),
    });
  }

  endSimulation() {
    // Stop all timers
    clearInterval(this.hourlyInterval);
    clearInterval(this.interpInterval);

    this.disableControlBoard();

    // Calculate final scores and feedback
    const finalScore = AverageArray(this.sessionData.efficiency);
    const sessionFeedback = DataManager.getSessionFeedback(this.sessionData);

    // Display score screen
    this.setState(
      {
        finalScore,
        finalFeedback: sessionFeedback.Body,
        currentSlide: 1,
        currentView: 'score',
        inSession: false,
      },
    );

    // Reset inactivity timer
    this.onActivity();

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

      // Clear the message queue so we don't
      // make uneccessary updates.
      this.messageQueue = {};

      // After sending all queued messages (including light bar updates),
      // publish them by executing the neopixel show command
      sendData('{neopixels-show:1}');
    }
  }

  render() {
    const {
      currentView,
      currentSlide,
      time,
      messageCenter,
      production,
      demand,
      efficiency,
      energyData,
      finalScore,
      wind,
      solarAvailability,
      blackout,
      finalFeedback,
      inSession,
      attractMode,
    } = this.state;

    if (attractMode === true) {
      return (
        <>
          <ArduinoEmulator onChange={this.onData} />
          <AttractScreen />
        </>
      );
    }

    return (
      <div className={`simulation ${!inSession ? 'inactive' : ''}`}>
        <DayCycle
          duration={(Settings.SESSION_DURATION / Settings.DAYS_PER_SESSION) / 1000}
          animOffset={-0.75}
          wind={wind}
          solarAvailability={solarAvailability}
          energyData={energyData}
          paused={!inSession}
          night={time < 30000 || time > 73000} // 8pm - 8am
          lights={time < 9000 || time > 81000}
        />
        <ArduinoEmulator onChange={this.onData} />
        <h1 className={`ready-prompt ${(time <= 0 && demand <= 0) ? 'show' : ''}`}>
          POWER YOUR CITY!
        </h1>
        <div className={`simulation-hud ${time <= 0 ? '' : 'show'}`}>
          <MessageCenter message={messageCenter} />
          <Container className={`current-conditions pane window solar ${solarAvailability > 0 ? '' : 'disable'}`}>
            <Row>
              <div className="condition-icon" />
            </Row>
            <Row>
              <h2 className="highlight">{NearestTimeInterval(time, Settings.CLOCK_INTERVAL_MINUTES)}</h2>
            </Row>
          </Container>
          <Container className={`current-conditions pane window wind ${wind < 8 ? 'disable' : ''}`}>
            <Row>
              <div className="condition-icon" />
            </Row>
            <Row>
              <h2 className="highlight">{`${wind} MPH`}</h2>
            </Row>
          </Container>
          <Container className="power-levels window pane">
            <Row>
              <MeterDiff
                level1={production}
                level2={demand}
                maxlevel={Settings.MAX_EXPECTED_DEMAND}
                barheight={590}
                efficiency={efficiency}
              />
              <PowerMeter label="Production" color="#43B94F" level={production} maxlevel={Settings.MAX_EXPECTED_DEMAND} barheight={590} />
              <PowerMeter label="Demand" color="#FB3D08" level={demand} maxlevel={Settings.MAX_EXPECTED_DEMAND} barheight={590} />
            </Row>
            <br />
            <Row>
              <Col style={{ textAlign: 'center' }}>
                <br />
                <GaugeChart
                  id="gauge-efficiency"
                  percent={efficiency}
                  colors={['#F9000F', '#FFD02A', '#34BF3E']}
                  animDelay={0}
                  hideText
                />
                <h3>
                  How are you doing?
                </h3>
              </Col>
            </Row>
          </Container>
        </div>
        <div className={`blackout ${blackout ? 'show' : ''}`} />
        {{
          ready: <ReadyScreen key="ready" currentView={`${currentView}${currentSlide}`} />,
          score: <ScoreScreen
            key="score"
            currentView={`${currentView}${currentSlide}`}
            feedbackMessage={finalFeedback}
            efficiencyScore={finalScore}
            chartData={energyData}
            customerFeedback={this.sessionData.feedback}
          />,
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
