import React from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';

const Day = ({ day, description, temperature }) => (

  <Col>
    <h4>{day}</h4>
    <p>{description}</p>
    <p>{temperature}</p>
  </Col>

);

Day.defaultProps = {
  description: ' ',
};

Day.propTypes = {
  day: PropTypes.string.isRequired,
  description: PropTypes.string,
  temperature: PropTypes.string.isRequired,
};

export default Day;
