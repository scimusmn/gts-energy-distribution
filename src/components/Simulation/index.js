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
      time: 0,
      hourIndex: 0,
      chartData: {},
    };

    this.onData = this.onData.bind(this);
    this.outputSerial = this.outputSerial.bind(this);
    this.calculateProductionSnapshot = this.calculateProductionSnapshot.bind(this);
    this.calculateEfficiencyScore = this.calculateEfficiencyScore.bind(this);

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

    // Immediately echo back light bar messages
    if (message.startsWith('hydro-') && message.endsWith('-lever')) {
      const panelId = message.substring(6, 7);
      const responseMsg = `{hydro-${panelId}-light-bar:${value}}`;
      const { sendData } = this.props;
      sendData(responseMsg);
    }
  }

  calculateProductionSnapshot() {
    const snapshot = {};

    // TODO: Here is where we will calculate values
    // based on which jacks are plugged in, and the
    // current state in relation to environmental 'potential'
    // production.solar = this.liveData['solar-1-jack'] * currentSolarPotential;
    console.log('calculateProductionSnapshot | ', this.liveData);

    // Temp (for sim mode)
    const { hourIndex } = this.state;
    const currentDemand = DataManager.getDemand(hourIndex);
    const simProdBaseLevel = currentDemand / 5;

    snapshot.coal = Math.round(simProdBaseLevel + Math.random() * 8 - 4);
    snapshot.gas = Math.round(simProdBaseLevel + Math.random() * 8 - 4);
    snapshot.hydro = Math.round(simProdBaseLevel + Math.random() * 8 - 4);
    snapshot.solar = Math.round(simProdBaseLevel + Math.random() * 8 - 4);
    snapshot.wind = Math.round(simProdBaseLevel + Math.random() * 8 - 4);

    // Sum all production values
    let total = 0;
    Object.values(snapshot).forEach((value) => {
      total += value;
    });
    snapshot.production = total;

    return snapshot;
  }

  calculateEfficiencyScore(production, demand) {
    console.log('calculateEfficiencyScore', this.energyData.production);
    const difference = (demand - production);
    const score = difference * Settings.EFFICIENCY_SCORE_MULTIPLIER;
    return score;
  }

  reset() {
    this.energyData = {
      coal: [],
      gas: [],
      hydro: [],
      solar: [],
      wind: [],
      demand: [],
      production: [],
    };
    this.liveData = {};
    clearInterval(this.hourlyInterval);
  }

  startSimulation() {
    this.reset();

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

      const { hourIndex, demand } = this.state;
      console.log('hour passed ->', hourIndex, demand);

      if (hourIndex >= totalHoursInSession) {
        this.endSimulation();
      } else {
        const productionSnapshot = this.calculateProductionSnapshot();

        // Add live production snapshot to production history
        Object.entries(productionSnapshot).forEach((entry) => {
          const [key, value] = entry;
          this.energyData[key].push(value);
        });

        const currentDemand = DataManager.getDemand(hourIndex);
        const score = this.calculateEfficiencyScore(productionSnapshot.production, currentDemand);
        console.log('efficiency score: ', score);

        this.setState({
          production: productionSnapshot.production,
          demand: currentDemand,
          messageCenter: DataManager.getRandomMessageCenter(),
          time: DataManager.getTime(hourIndex),
          hourIndex: hourIndex + 1,
          chartData: this.energyData,
        });
      }
    }, hourInterval);
  }

  nextHour() {
    console.log('endSimulation');
    const { efficiencyScore } = this.state;
    console.log('efficiency score', efficiencyScore);

    clearInterval(this.hourlyInterval);
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
      time, forecast, messageCenter, production, demand, chartData,
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
              <h4>
                Efficiency:
                {' '}
                {this.calculateEfficiencyScore(production, demand)}
              </h4>
            </Col>
          </Row>
        </Container>
        <div className="energy-chart window">
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
