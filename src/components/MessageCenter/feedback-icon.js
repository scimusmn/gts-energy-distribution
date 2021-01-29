import React from 'react';
import PropTypes from 'prop-types';

function FeedbackIcon({ mood }) {
  return (
    <>
      {mood === 'angry' ? <span role="img" aria-label="angry">😠</span> : <span role="img" aria-label="happy">😍</span>}
    </>
  );
}

FeedbackIcon.propTypes = {
  mood: PropTypes.string.isRequired,
};

export default FeedbackIcon;
