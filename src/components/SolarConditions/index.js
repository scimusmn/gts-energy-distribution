import React from 'react';
import { Container, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import Settings from '../../data/settings';
import { NearestTimeInterval } from '../../utils';

const SolarConditions = ({ time, solarAvailability }) => (
  <Container className={`current-conditions pane window solar ${solarAvailability > 0 ? '' : 'disable'}`}>
    <Row>
      <div className="condition-icon" />
    </Row>
    <Row>
      <h2 className="highlight">{NearestTimeInterval(time, Settings.CLOCK_INTERVAL_MINUTES)}</h2>
    </Row>
  </Container>
);

SolarConditions.propTypes = {
  time: PropTypes.number.isRequired,
  solarAvailability: PropTypes.number.isRequired,
};

export default SolarConditions;
