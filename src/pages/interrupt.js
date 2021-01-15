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
      minDelay: 250.0,
    };

    this.onData = this.onData.bind(this);
    this.sendClick = this.sendClick.bind(this);
    this.setMinimumDelay = this.setMinimumDelay.bind(this);
    this.shiftOutNextMessage = this.shiftOutNextMessage.bind(this);
    this.queueOutgoingMessage = this.queueOutgoingMessage.bind(this);

    this.myRef = React.createRef();

    this.logLimit = 40;
    this.logArray = [];

    this.outgoingQueue = [];

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
    // console.log('onData:', data);

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
        this.queueOutgoingMessage(response);
      }
    }
  }

  setMinimumDelay(val) {
    console.log('setMinimumDelay:', val);
    this.setState({ minDelay: parseFloat(val) });

    clearInterval(this.outMsgTimer);

    this.outMsgTimer = setInterval(() => {
      this.shiftOutNextMessage();
    }, parseFloat(val));
  }

  sendClick(msg) {
    console.log('sendClick:', msg);
    const { sendData } = this.props;
    sendData(msg);
  }

  shiftOutNextMessage() {
    console.log('shiftOutNextMessage:', this.outgoingQueue.length);
    const { sendData } = this.props;

    if (this.outgoingQueue.length > 0) {
      for (let i = 0; i < this.outgoingQueue.length; i += 1) {
        const outgoingMsg = this.outgoingQueue[i];

        this.logArray.push(`<br><span style="color:Navy;">OUT ←&nbsp;</span> ${outgoingMsg}`);

        sendData(outgoingMsg);

        if (this.logArray.length > this.logLimit) {
          this.logArray.shift();
        }
      }

      this.outgoingQueue = [];

      const npShowMsg = '{neopixels-show:1}';
      this.logArray.push(`<br><span style="color:Blue;">OUT ←< &nbsp;</span> ${npShowMsg}`);
      sendData(npShowMsg);

      if (this.logArray.length > this.logLimit) {
        this.logArray.shift();
      }
    }
  }

  queueOutgoingMessage(msg) {
    // console.log('queueOutgoingMessage:', this.outgoingQueue.length);
    this.outgoingQueue.push(msg);

    // Instead of queuing, I am pushing out immediately, and using
    // queue timing to send "Show" command.
    // const { sendData } = this.props;
    // this.logArray.push(`<br><span style="color:Navy;">OUT ←&nbsp;</span> ${msg}`);
    // if (this.logArray.length > this.logLimit) {
    //   this.logArray.shift();
    // }
    // sendData(msg);
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
                placeholder="250"
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
