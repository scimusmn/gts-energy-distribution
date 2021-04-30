import React from 'react';
import PropTypes from 'prop-types';
import Sky from './Sky';
import Sun from './Sun';
import Clouds from './Clouds';

const DayCycle = ({ duration, wind }) => (
  <div className="day-cycle">
    <Sky duration={duration} />
    <Sun duration={duration} />
    <Clouds wind={wind} quantity={5} />
  </div>
);

DayCycle.propTypes = {
  duration: PropTypes.number.isRequired,
  wind: PropTypes.number.isRequired,
};

export default DayCycle;
