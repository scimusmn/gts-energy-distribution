/* eslint no-console: 0 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { Container, Row } from 'reactstrap';
import withSerialCommunication from '../../Arduino/arduino-base/ReactSerial/SerialHOC';
import ArduinoEmulator from '../ArduinoEmulator';
import DataManager from '../../data/data-manager';
import Settings from '../../data/settings';
import Forecast from '../Forecast';
import PowerMeter from '../PowerMeter';

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
      efficiencyScore: 0,
    };

    this.onData = this.onData.bind(this);
    this.outputSerial = this.outputSerial.bind(this);

    this.hourlyInterval = {};
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);

    console.log('Simulation mounted');

    this.startSimulation();
  }

  onData(data) {
    console.log('onData:', data);

    const message = Object.keys(data)[0];
    const value = Object.values(data)[0];

    console.log('onData - Simulation');
    console.log(message, value);

    // For testing purposes, all incoming
    // `hydro-X-lever` msgs are immediately
    // responded to with an outgoing `hydro-X-light-bar` msg.

    if (message.startsWith('hydro-') && message.endsWith('-lever')) {
      console.log('hydro lever input recognized');
      const panelId = message.substring(6, 7);
      const responseMsg = `hydro-${panelId}-light-bar`;
      const responseVal = Object.values(data)[0];
      const response = `{${responseMsg}:${responseVal}}`;
      console.log('responseObj', response);
      const { sendData } = this.props;
      sendData(response);
    }
  }

  startSimulation() {
    const dayInterval = Settings.SESSION_DURATION / Settings.DAYS_PER_SESSION;
    const hourInterval = Math.ceil(dayInterval / Settings.DAYS_PER_SESSION);
    console.log('starting session with hourInterval', hourInterval);

    // Select forecast data for this session
    DataManager.selectNewForecast();

    this.setState({ forecast: DataManager.getForecastSummary() });

    this.hourlyInterval = setInterval(() => {
      const { hourIndex, demand } = this.state;
      console.log('hour passed ->', hourIndex, demand);

      if (hourIndex > 36) {
        this.endSimulation();
      } else {
        this.setState({
          messageCenter: DataManager.getRandomMessageCenter(),
          production: Math.round(Math.random() * 100),
          demand: DataManager.getDemand(hourIndex),
          time: DataManager.getTime(hourIndex),
          hourIndex: hourIndex + 1,
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
      time, forecast, messageCenter, production, demand,
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
        </Container>
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
