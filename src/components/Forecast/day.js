/* eslint no-console: 0 */
import React from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';
import ConditionIcon from './condition-icon';

const Day = ({
  day, description, temperature, icon,
}) => (

  <Col className="day">
    <h4>{day}</h4>
    <h2>
      {temperature}
      °
    </h2>
    <p>{description}</p>
    <ConditionIcon condition={icon} />
  </Col>

);

Day.defaultProps = {
  description: ' ',
  icon: 'clear',
};

Day.propTypes = {
  day: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.string,
  temperature: PropTypes.string.isRequired,
};

export default Day;
