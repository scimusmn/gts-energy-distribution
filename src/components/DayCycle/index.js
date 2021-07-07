import React from 'react';
import PropTypes from 'prop-types';
import Sky from './Sky';
import Sun from './Sun';
import Clouds from './Clouds';
import Cityscape from './Cityscape';

const DayCycle = ({
  duration, animOffset, wind, solarAvailability, paused,
}) => (
  <div className={paused ? 'day-cycle paused' : 'day-cycle'}>
    <Sky duration={duration} animOffset={animOffset} paused={paused} />
    <Sun duration={duration} animOffset={animOffset} paused={paused} />
    <Clouds wind={wind} quantity={5} />
    <Cityscape
      wind={wind >= 8}
      solar={solarAvailability >= 0.1}
      gas={false}
      coal={false}
      hydro={false}
    />
  </div>
);

DayCycle.propTypes = {
  duration: PropTypes.number.isRequired,
  animOffset: PropTypes.number.isRequired,
  wind: PropTypes.number.isRequired,
  solarAvailability: PropTypes.number.isRequired,
  paused: PropTypes.bool.isRequired,
};

export default DayCycle;
