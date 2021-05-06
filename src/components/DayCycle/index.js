import React from 'react';
import PropTypes from 'prop-types';
import Sky from './Sky';
import Sun from './Sun';
import Clouds from './Clouds';

const DayCycle = ({
  duration, animOffset, wind, paused,
}) => (
  <div className={paused ? 'day-cycle paused' : 'day-cycle'}>
    <Sky duration={duration} animOffset={animOffset} paused={paused} />
    <Sun duration={duration} animOffset={animOffset} paused={paused} />
    <Clouds wind={wind} quantity={5} />
  </div>
);

DayCycle.propTypes = {
  duration: PropTypes.number.isRequired,
  animOffset: PropTypes.number.isRequired,
  wind: PropTypes.number.isRequired,
  paused: PropTypes.bool.isRequired,
};

export default DayCycle;
