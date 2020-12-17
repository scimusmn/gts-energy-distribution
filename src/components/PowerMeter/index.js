/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

const PowerMeter = ({ label, color, level }) => (
  <Container>
    <Row>
      <Col>
        <h3>{label}</h3>
      </Col>
    </Row>
    <Row>
      <Col>
        <h3 style={{ backgroundColor: color, color: 'purple' }}>{level.toFixed(2)}</h3>
      </Col>
    </Row>
  </Container>
);

PowerMeter.defaultProps = {
  label: 'Power',
  color: 'gray',
  level: 0,
};

PowerMeter.propTypes = {
  label: PropTypes.string,
  color: PropTypes.string,
  level: PropTypes.number,
};

export default PowerMeter;
