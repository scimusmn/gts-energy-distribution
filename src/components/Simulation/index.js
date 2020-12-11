/* eslint no-console: 0 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import withSerialCommunication from '../../Arduino/arduino-base/ReactSerial/SerialHOC';
import DataManager from '../../data/data-manager';
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
    };

    this.onData = this.onData.bind(this);
    this.outputSerial = this.outputSerial.bind(this);
    // this.getRandomForecast = this.getRandomForecast.bind(this);
    // this.getRandomMessageCenter = this.getRandomMessageCenter.bind(this);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);

    console.log('Simulation mounted');

    // Temp - uncomment to provide
    // random state updates on an interval
    setInterval(() => {
      console.log('randomize');
      this.setState({
        forecast: DataManager.getRandomForecast(5),
        messageCenter: DataManager.getRandomMessageCenter(),
        production: Math.random(),
        demand: Math.random(),
        time: new Date().getTime(),
      });
    }, 5000);
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
      <div>
        <h1>
          Simulation session
        </h1>
        <hr />
        <Forecast days={forecast} />
        <br />
        <hr />
        <div className="message-center">
          <h3>Message Center</h3>
          <h4>
            {messageCenter.mood === 'angry' ? <span role="img" aria-label="angry">😠</span> : <span role="img" aria-label="happy">😍</span>}
          </h4>
          <p>{messageCenter.body}</p>
          <h4>
            <Moment date={time} format="hh:mm:ss" />
          </h4>
        </div>
        <br />
        <hr />
        <div className="power-levels">
          <PowerMeter title="Production" color="green" level={production} />
          <PowerMeter title="Demand" color="orange" level={demand} />
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
