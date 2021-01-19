/* eslint no-console: 0 */
/* eslint react/prop-types: 0 */
/* eslint no-return-assign: 0 */

import React, { Component } from 'react';
import {
  InputGroup, InputGroupAddon, Button, Input,
} from 'reactstrap';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';

class DebugPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      minDelay: 50.0,
    };

    this.onData = this.onData.bind(this);
    this.sendClick = this.sendClick.bind(this);
    this.setMinimumDelay = this.setMinimumDelay.bind(this);
    this.shiftOutUpdates = this.shiftOutUpdates.bind(this);

    this.myRef = React.createRef();

    this.logLimit = 30;
    this.logArray = [];

    this.latestData = {};
    this.outMsgTimer = {};
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    const { minDelay } = this.state;
    setOnDataCallback(this.onData);

    setInterval(() => {
      this.myRef.current.innerHTML = this.logArray;
    }, 150);

    this.setMinimumDelay(minDelay);
  }

  onData(data) {
    const inMsg = Object.keys(data)[0];

    console.log('onData:', inMsg);

    this.logArray.push(`<br><span style="color:#CD5C5C;">IN &nbsp;&nbsp;→ &nbsp;</span> ${JSON.stringify(data)}`);

    if (this.logArray.length > this.logLimit) {
      // console.log('shifting', this.logArray.length);
      this.logArray.shift();
    }

    // For testing purposes, all incoming
    // `hydro-X-lever` msgs are immediately
    // responded to with an outgoing `hydro-X-light-bar` msg.
    if (inMsg.startsWith('hydro-') && inMsg.endsWith('-lever')) {
      const responseVal = Object.values(data)[0];

      const allLightBarMsgs = [
        'gas-1-light-bar',
        'gas-2-light-bar',
        'gas-3-light-bar',
        'solar-1-light-bar',
        'solar-2-light-bar',
        'solar-3-light-bar',
        'wind-1-light-bar',
        'wind-2-light-bar',
        'wind-3-light-bar',
        'hydro-1-light-bar',
        'hydro-2-light-bar',
      ];

      for (let i = 0; i < allLightBarMsgs.length; i += 1) {
        const lightBarMessage = allLightBarMsgs[i];

        // Set latest data using message as key
        // This will intentionally overwrite any data
        // that has not already been output with same key
        this.latestData[lightBarMessage] = responseVal;
      }
    }
  }

  setMinimumDelay(val) {
    console.log('setMinimumDelay:', val);
    this.setState({ minDelay: parseFloat(val) });

    clearInterval(this.outMsgTimer);

    this.outMsgTimer = setInterval(() => {
      this.shiftOutUpdates();
    }, parseFloat(val));
  }

  sendClick(msg) {
    console.log('sendClick:', msg);
    const { sendData } = this.props;
    sendData(msg);
  }

  shiftOutUpdates() {
    const { sendData } = this.props;

    const entries = Object.entries(this.latestData);

    if (entries.length > 0) {
      for (let i = 0; i < entries.length; i += 1) {
        const [key, value] = entries[i];
        const outgoingMessage = `{${key}:${value}}`;

        this.logArray.push(`<br><span style="color:Navy;">OUT ←&nbsp;</span> ${outgoingMessage}`);

        console.log('sendData:', outgoingMessage);
        sendData(outgoingMessage);
      }

      // Clear latest data so we don't
      // make uneccessary updates.
      this.latestData = {};

      // After sending all pixel updates,
      // 'publish' them by following a the show command
      const npShowMsg = '{neopixels-show:1}';
      this.logArray.push(`<br><strong><span style="color:Navy;">OUT ← &nbsp;</span></strong> ${npShowMsg}`);
      console.log('! sendData:', npShowMsg);
      sendData(npShowMsg);

      // Keep log trimmed
      const numToRemove = Math.max(0, (this.logArray.length - this.logLimit));
      this.logArray.splice(0, numToRemove);
    } else {
      console.log('No new data to output');
    }
  }

  render() {
    const { ipcAvailable } = this.props;
    const { minDelay } = this.state;
    return (
      <div style={{ padding: '3%', backgroundColor: '#FFA07A' }}>
        <h1>
          Interrupt Test Page
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            color="primary"
            onClick={() => this.sendClick('{wake-arduino:1}')}
          >
            wake-arduino
          </Button>
          <Button
            color="primary"
            onClick={() => this.sendClick('{neopixels-show:1}')}
          >
            neopixels-show
          </Button>
        </div>
        <br />
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
        <div>
          <h5>
            Minimum delay between
            {' '}
            <strong>neopixels-show</strong>
            :
            {' '}
            {minDelay}
          </h5>
          <br />
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <Button
                color="primary"
                onClick={() => this.setMinimumDelay(this.sendTextInput.value)}
              >
                Set:
              </Button>
              <Input
                innerRef={(input) => (this.sendTextInput = input)}
                placeholder={minDelay}
              />
            </InputGroupAddon>
          </InputGroup>
        </div>
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
