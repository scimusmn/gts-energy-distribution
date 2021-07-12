import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function Sun({ duration, animOffset, paused }) {
  const sunRef = useRef();
  const moonRef = useRef();

  useEffect(() => {
    if (!paused) {
      // sunRef.current.style.animation = 'none';
      // setTimeout(() => {
      //   sunRef.current.style.animation = '';
      // }, 15);
    }
  }, [paused]);

  return (
    <>
      {!paused
      && (
        <>
          <div
            className="sun"
            ref={sunRef}
            style={{
              animationDuration: `${duration}s`,
              animationDelay: `${animOffset * duration}s`,
            }}
          />
          <div
            className="moon"
            ref={moonRef}
            style={{
              animationDuration: `${duration}s`,
              animationDelay: `${animOffset * duration}s`,
            }}
          />
        </>
      )}
    </>
  );
}

Sun.propTypes = {
  duration: PropTypes.number.isRequired,
  animOffset: PropTypes.number.isRequired,
  paused: PropTypes.bool.isRequired,
};

export default Sun;
