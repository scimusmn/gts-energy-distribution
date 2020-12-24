/* eslint no-console: 0 */
/* eslint react/prop-types: 0 */

import React, { Component } from 'react';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';

class DebugPage extends Component {
  constructor(props) {
    super(props);

    this.onData = this.onData.bind(this);

    this.myRef = React.createRef();

    this.logLimit = 25;
    this.logArray = [];
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);

    setInterval(() => {
      this.myRef.current.innerHTML = this.logArray;
    }, 150);
  }

  onData(data) {
    // console.log('onData:', data);

    const { sendData } = this.props;

    this.logArray.push(`<br><span style="color:#CD5C5C;">IN &nbsp;&nbsp;→ &nbsp;</span> ${JSON.stringify(data)}`);

    if (this.logArray.length > this.logLimit) {
      console.log('shifting', this.logArray.length);
      this.logArray.shift();
    }


    // For testing purposes, all incoming
    // `hydro-X-lever` msgs are immediately
    // responded to with an outgoing `hydro-X-light-bar` msg.
    const inMsg = Object.keys(data)[0];
    if (inMsg.startsWith('hydro-') && inMsg.endsWith('-lever')) {
      const responseVal = Object.values(data)[0];

      const allLightBarMsgs = [
        'wind-1-light-bar',
        'solar-1-light-bar',
        'hydro-1-light-bar',
        'gas-1-light-bar',
        'wind-2-light-bar',
        'solar-2-light-bar',
        'hydro-2-light-bar',
        'gas-2-light-bar'];

      for (let i = 0; i < allLightBarMsgs.length; i += 1) {
        const lbMsg = allLightBarMsgs[i];
        const response = `{${lbMsg}:${responseVal}}`;

        sendData(response);

        this.logArray.push(`<br><span style="color:Navy;">OUT ←&nbsp;</span> ${response}`);
        if (this.logArray.length > this.logLimit) {
          this.logArray.shift();
        }
      }
    }
  }

  render() {
    const { ipcAvailable } = this.props;
    return (
      <div style={{ padding: '3%', backgroundColor: '#FFA07A' }}>
        <h1>
          Interrupt Test Page
        </h1>
        <p>
          Send any hydro-X-lever message, and application
          {' '}
          will send back
          {' '}
          <strong>many</strong>
          {' '}
          light bar messages.
        </p>
        <hr />
        <br />
        <h4>
          Log
        </h4>
        <p ref={this.myRef} style={{ padding: '2%', backgroundColor: '#eeeeee', fontSize: '10px' }} />
        <br />
        <hr />
        <br />
        <h4>
          <strong>IPC communication available:</strong>
          {' '}
          <span style={{ color: ipcAvailable.toString() === 'false' ? 'red' : 'green' }}>{ipcAvailable.toString()}</span>
        </h4>
      </div>
    );
  }
}

const DebugPageWithSerialCommunication = withSerialCommunication(DebugPage);

export default DebugPageWithSerialCommunication;
