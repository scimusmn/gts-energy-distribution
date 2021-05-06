import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function Sun({ duration, animOffset, paused }) {
  const sunRef = useRef();

  useEffect(() => {
    if (!paused) {
      sunRef.current.style.animation = 'none';
      setTimeout(() => {
        sunRef.current.style.animation = '';
      }, 15);
    }
  }, [paused]);

  return (
    <div
      className="sun"
      ref={sunRef}
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${animOffset}s`,
      }}
    />
  );
}

Sun.propTypes = {
  duration: PropTypes.number.isRequired,
  animOffset: PropTypes.number.isRequired,
  paused: PropTypes.bool.isRequired,
};

export default Sun;
