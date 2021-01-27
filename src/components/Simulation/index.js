/* eslint no-console: 0 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { Container, Row, Col } from 'reactstrap';
import withSerialCommunication from '../../Arduino/arduino-base/ReactSerial/SerialHOC';
import ArduinoEmulator from '../ArduinoEmulator';
import DataManager from '../../data/data-manager';
import Settings from '../../data/settings';
import Forecast from '../Forecast';
import PowerMeter from '../PowerMeter';
import EnergyChart from '../EnergyChart';

class Simulation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      forecast: [],
      messageCenter: {},
      production: 0,
      demand: 0,
      efficiency: 0,
      time: 0,
      hourIndex: 0,
      chartData: {},
    };

    this.onData = this.onData.bind(this);
    this.outputSerial = this.outputSerial.bind(this);
    this.getCurrentProduction = this.getCurrentProduction.bind(this);

    this.liveData = {};
    this.energyData = {};

    this.hourlyInterval = {};
  }


  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);

    console.log('Simulation mounted');

    this.startSimulation();
  }

  onData(data) {
    // console.log('onData:', data);

    const message = Object.keys(data)[0];
    const value = Object.values(data)[0];

    this.liveData[message] = value;

    // Catch gas arrow buttons exceptions. These messages
    // don't provide the current value, but are used to adjust the
    // current value, which we add to the liveData object.
    if (message.startsWith('gas-') && message.includes('-button-')) {
      const panelId = message.substring(4, 5);
      const levelKey = `gas-${panelId}-level`;
      let currentLevel = this.liveData[levelKey];
      if (!currentLevel) currentLevel = 0.0;

      let adjustment = 1.0;
      // Increment if up arrow was pressed,
      // decrement if down arrow was pressed
      if (message.endsWith('-down')) adjustment *= -1;
      let newVal = currentLevel + adjustment;
      // Clamp to 0–100;
      newVal = Math.min(Math.max(newVal, 0), 100);
      this.liveData[levelKey] = newVal;
      console.log('arrow btn pressed', panelId, newVal);
    }

    // Immediately echo back light bar messages
    // if (message.startsWith('hydro-') && message.endsWith('-lever')) {
    //   const panelId = message.substring(6, 7);
    //   const responseMsg = `{hydro-${panelId}-light-bar:${value}}`;
    //   const { sendData } = this.props;
    //   sendData(responseMsg);
    // }
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
      let controlLevel = this.liveData[`${panelId}-switch`];
      if (!controlLevel || controlLevel !== 1) controlLevel = 0.0;

      // TODO: We currently are using the current switch value (1/0),
      // but we'll need to eventually swap for the decoupled "state"
      // of each panel. ('off', 'warming', 'on')

      const panelProduction = controlLevel * Settings.MAX_OUTPUT_PER_PANEL;
      coalProduction += panelProduction;
    }

    // GAS production
    let gasProduction = 0.0;
    for (let i = 0; i < activePanels.gas.length; i += 1) {
      const panelId = activePanels.gas[i];

      // Gas input level (created from button presses)
      const controlLevel = this.liveData[`${panelId}-level`];

      const panelProduction = controlLevel * Settings.MAX_OUTPUT_PER_PANEL;
      gasProduction += panelProduction;
    }

    // HYDRO production
    let hydroProduction = 0.0;
    for (let i = 0; i < activePanels.hydro.length; i += 1) {
      const panelId = activePanels.hydro[i];

      // Hydro panel lever input
      const controlLevel = this.liveData[`${panelId}-lever`];
      const panelProduction = controlLevel * Settings.MAX_OUTPUT_PER_PANEL;
      hydroProduction += panelProduction;
    }

    // SOLAR production
    const solarAvailability = DataManager.getSolarAvailability(hourIndex);
    const numSolarPanels = activePanels.solar.length;
    const solarProduction = numSolarPanels * solarAvailability * Settings.MAX_OUTPUT_PER_PANEL;

    // WIND production
    const windAvailability = DataManager.getWindAvailability(hourIndex);
    const numWindPanels = activePanels.wind.length;
    const windProduction = numWindPanels * windAvailability * Settings.MAX_OUTPUT_PER_PANEL;

    // Production snapshot object
    const production = {
      coal: coalProduction,
      gas: gasProduction,
      hydro: hydroProduction,
      solar: solarProduction,
      wind: windProduction,
    };

    // Sum all production values for easy total
    let total = 0;
    Object.values(production).forEach((value) => {
      total += value;
    });
    production.total = total;

    console.log('Production snapshot:');
    console.log(production);

    return production;
  }

  reset() {
    this.energyData = {
      coal: [],
      gas: [],
      hydro: [],
      solar: [],
      wind: [],
      demand: [],
      total: [],
    };
    this.liveData = {};
    clearInterval(this.hourlyInterval);
  }

  startSimulation() {
    this.reset();

    // Get all starting states from Arduino
    const { sendData } = this.props;
    const getFullStateMsg = '{get-all-states:1}';
    sendData(getFullStateMsg);

    const dayInterval = Settings.SESSION_DURATION / Settings.DAYS_PER_SESSION;
    console.log('dayInterval', dayInterval);
    const hourInterval = Math.ceil(dayInterval / 24);
    console.log('hourInterval', hourInterval);
    const totalHoursInSession = 24 * Settings.DAYS_PER_SESSION;
    console.log('totalHoursInSession', totalHoursInSession);
    console.log('starting session with hourInterval', hourInterval);

    // Select forecast data for this session
    DataManager.selectNewForecast();

    // Pre-populate chart with demand.
    this.energyData.demand = DataManager.getCurrentForecastField('Demand');

    this.setState({ forecast: DataManager.getForecastSummary(), chartData: this.energyData });

    this.hourlyInterval = setInterval(() => {
      const { hourIndex } = this.state;
      console.log('Hour passed ->', hourIndex);

      if (hourIndex >= totalHoursInSession) {
        this.endSimulation();
      } else {
        const productionSnapshot = this.getCurrentProduction();
        const production = productionSnapshot.total;

        // Add live production snapshot to production history
        Object.entries(productionSnapshot).forEach((entry) => {
          const [key, value] = entry;
          this.energyData[key].push(value);
        });

        const demand = DataManager.getDemand(hourIndex);

        // Calculate efficiency score

        const difference = (demand - production);
        console.log(difference);
        const efficiency = difference * Settings.EFFICIENCY_SCORE_MULTIPLIER;

        this.setState({
          production,
          demand,
          efficiency,
          messageCenter: DataManager.getRandomMessageCenter(),
          time: DataManager.getTime(hourIndex),
          hourIndex: hourIndex + 1,
          chartData: this.energyData,
        });
      }
    }, hourInterval);
  }

  endSimulation() {
    console.log('endSimulation');
    const { efficiencyScore } = this.state;
    console.log('efficiency score', efficiencyScore);

    clearInterval(this.hourlyInterval);
  }

  outputSerial(msg) {
    console.log('outputSerial:', msg);

    // This is where we pass messages
    // to Serial device.
    const { sendData } = this.props;
    sendData(msg);
  }

  render() {
    const {
      time, forecast, messageCenter, production, demand, efficiency, chartData,
    } = this.state;
    return (
      <div className="simulation">
        <ArduinoEmulator onChange={this.onData} />
        <Forecast days={forecast} />
        <div className="message-center window">
          <h3>Message Center</h3>
          <h4>
            {messageCenter.Mood === 'angry' ? <span role="img" aria-label="angry">😠</span> : <span role="img" aria-label="happy">😍</span>}
          </h4>
          <p>{messageCenter.Body}</p>
          <h4>
            Time:
            {' '}
            <Moment date={time} format="hh:mm" />
            <br />
            {time}
          </h4>
        </div>
        <Container className="power-levels window">
          <Row>
            <PowerMeter label="Production" color="green" level={production} barHeight={450} />
            <PowerMeter label="Demand" color="orange" level={demand} barHeight={450} />
          </Row>
          <br />
          <Row>
            <Col>
              <h3>
                Efficiency:
                {' '}
              </h3>
              <h1>
                {efficiency}
              </h1>
            </Col>
          </Row>
        </Container>
        <div className="energy-chart window" style={{ display: 'none' }}>
          <h3>Energy Chart</h3>
          <EnergyChart chartData={chartData} />
        </div>
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
