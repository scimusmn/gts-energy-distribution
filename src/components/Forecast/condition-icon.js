/* eslint no-console: 0 */
import React from 'react';
import PropTypes from 'prop-types';

const ConditionIcon = ({
  condition, pixelSize,
}) => (
  <i className={`wu wu-black wu-${pixelSize} wu-${ConditionIcon.lookupIcon(condition)}`} />
);

ConditionIcon.defaultProps = {
  condition: 'clear',
  pixelSize: 128,
};

ConditionIcon.propTypes = {
  condition: PropTypes.string,
  pixelSize: PropTypes.oneOf([16, 32, 64, 128, 256]),
};

ConditionIcon.lookupIcon = (condition) => {
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

export default ConditionIcon;
