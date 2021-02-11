/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import { NewKey } from '../../utils';
import Day from './day';

const Forecast = ({ days }) => (
  <Container className="forecast window" style={{ display: 'none' }}>
    <Row>
      <Col>
        <h2>Weather forecast</h2>
      </Col>
    </Row>
    <hr />
    <Row>
      {days.map((day) => (
        <Day
          key={NewKey()}
          day={day.Day}
          description={day.Condition}
          icon={day.Condition}
          temperature={day.Temperature}
        />
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
