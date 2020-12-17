import React from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';

const Day = ({
  day, description, temperature, icon,
}) => (

  <Col className="day">
    <h4>{day}</h4>
    <p>{description}</p>
    <h2>
      {temperature}
      °
    </h2>
    <i className={`wu wu-black wu-128 wu-${icon}`} />
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
