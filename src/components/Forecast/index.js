/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import { NewKey } from '../../utils';
import Day from './day';

const Forecast = ({ days }) => (
  <Container>
    <Row>
      <Col>
        <h2>Weather Forecast</h2>
      </Col>
    </Row>
    <Row>
      {days.map((day) => (
        <Day key={NewKey()} {...day} />
      ))}
    </Row>
  </Container>
);

Forecast.defaultProps = {
  days: [],
};

Forecast.propTypes = {
  days: PropTypes.instanceOf(Object),
};

export default Forecast;
