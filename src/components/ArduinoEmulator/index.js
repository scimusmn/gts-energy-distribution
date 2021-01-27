/* eslint-disable react/jsx-props-no-spreading */
/* eslint no-console: 0 */

import React, { useState } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import { GlobalHotKeys } from 'react-hotkeys';
import Range from './inputs/range';
import Toggle from './inputs/toggle';
import EventButton from './inputs/eventbutton';

const ArduinoEmulator = ({ onChange }) => {
  const [visible, setVisible] = useState(false);

  const coalCount = 6;
  const gasCount = 2;
  const hydroCount = 2;
  const solarCount = 3;
  const windCount = 3;

  const coalPanels = [];
  for (let i = 0; i < coalCount; i += 1) {
    const panelNum = i + 1;
    coalPanels.push((
      <Col key={i}>
        <p>{panelNum}</p>
        <Toggle msg={`coal-${panelNum}-jack`} onChange={onChange} />
        <br />
        <br />
        <p>SWITCH</p>
        <div className="vertical">
          <Toggle msg={`coal-${panelNum}-switch`} onChange={onChange} />
          <br />
        </div>
        <br />
      </Col>
    ));
  }

  const gasPanels = [];
  for (let i = 0; i < gasCount; i += 1) {
    const panelNum = i + 1;
    gasPanels.push((
      <Col key={i}>
        <p>{panelNum}</p>
        <Toggle msg={`gas-${panelNum}-jack`} onChange={onChange} />
        <br />
        <br />
        <EventButton msg={`gas-${panelNum}-button-up`} label="▲" onChange={onChange} />
        <br />
        <br />
        <EventButton msg={`gas-${panelNum}-button-down`} label="▼" onChange={onChange} />
      </Col>
    ));
  }

  const hydroPanels = [];
  for (let i = 0; i < hydroCount; i += 1) {
    const panelNum = i + 1;
    hydroPanels.push((
      <Col key={i}>
        <p>{panelNum}</p>
        <Toggle msg={`hydro-${panelNum}-jack`} onChange={onChange} />
        <Range msg={`hydro-${panelNum}-lever`} onChange={onChange} />
      </Col>
    ));
  }

  const solarPanels = [];
  for (let i = 0; i < solarCount; i += 1) {
    const panelNum = i + 1;
    solarPanels.push((
      <Col key={i}>
        <p>{panelNum}</p>
        <Toggle msg={`solar-${panelNum}-jack`} onChange={onChange} />
      </Col>
    ));
  }

  const windPanels = [];
  for (let i = 0; i < windCount; i += 1) {
    const panelNum = i + 1;
    windPanels.push((
      <Col key={i}>
        <p>{panelNum}</p>
        <Toggle msg={`wind-${panelNum}-jack`} onChange={onChange} />
      </Col>
    ));
  }

  return (
    <div className="emulator" style={visible ? { display: 'block' } : { display: 'none' }}>
      <GlobalHotKeys
        keyMap={{ TOGGLE_EMULATION: 'e' }}
        handlers={{ TOGGLE_EMULATION: () => setVisible((state) => !state) }}
      />
      <Row>
        <Col className="panel">
          <h3>Coal</h3>
          <Row>
            {coalPanels}
          </Row>
        </Col>
        <Col className="panel">
          <h3>Gas</h3>
          <Row>
            {gasPanels}
          </Row>
        </Col>
        <Col className="panel">
          <h3>Hydro</h3>
          <Row>
            {hydroPanels}
          </Row>
        </Col>
        <Col className="panel">
          <h3>Solar</h3>
          <Row>
            {solarPanels}
          </Row>
        </Col>
        <Col className="panel">
          <h3>Wind</h3>
          <Row>
            {windPanels}
          </Row>
        </Col>
      </Row>
      <Row>
        <Col className="panel">
          <Row>
            <Col>
              <EventButton msg="start-button" label="Start" onChange={onChange} />
            </Col>
            <Col>
              <h4>
                Press
                {' '}
                <strong>&apos;e&apos;</strong>
                {' '}
                to close
              </h4>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

ArduinoEmulator.propTypes = {
  onChange: PropTypes.instanceOf(Function).isRequired,
};

export default ArduinoEmulator;
