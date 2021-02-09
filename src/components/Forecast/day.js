/* eslint no-console: 0 */
import React from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';

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
    <i className={`wu wu-black wu-128 wu-${Day.lookupIcon(icon)}`} />
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

Day.lookupIcon = (condition) => {
  switch (condition) {
    case 'Fair':
      return 'clear';
    case 'Partly Cloudy':
      return 'partlycloudy';
    case 'Mostly Cloudy':
      return 'mostlycloudy';
    case 'Cloudy':
      return 'cloudy';
    case 'Light Snow':
      return 'chancesnow';
    default:
      console.log('Warning! Condition unrecognized:', condition);
      return 'clear';
  }
};

export default Day;
