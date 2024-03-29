import React from 'react';
import PropTypes from 'prop-types';

const ReadyPrompt = ({ show }) => (
  <h1 className={`ready-prompt ${show ? 'show' : ''}`}>
    <br />
    Get ready!
  </h1>
);

ReadyPrompt.propTypes = {
  show: PropTypes.bool.isRequired,
};

export default ReadyPrompt;
