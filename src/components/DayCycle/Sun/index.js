import React from 'react';
import PropTypes from 'prop-types';

const Sun = ({ duration }) => (
  <div className="sun" style={{ animationDuration: `${duration}s` }} />
);

Sun.propTypes = {
  duration: PropTypes.number.isRequired,
};

export default Sun;
