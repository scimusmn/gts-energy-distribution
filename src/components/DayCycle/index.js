/* eslint no-unused-vars: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import Sky from './Sky';
import Sun from './Sun';

const DayCycle = ({ duration, wind }) => (
  <div className="day-cycle">
    <Sky duration={duration} />
    <Sun duration={duration} />
  </div>
);

DayCycle.propTypes = {
  duration: PropTypes.number.isRequired,
  wind: PropTypes.number.isRequired,
};

export default DayCycle;
