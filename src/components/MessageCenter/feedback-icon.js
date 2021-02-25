import React from 'react';
import PropTypes from 'prop-types';

function FeedbackIcon({ mood }) {
  let icon = '🙂';
  if (mood === 'angry') {
    icon = '😠';
  } else if (mood === 'happy') {
    icon = '😍';
  }

  return <span role="img" className="feedback-icon" aria-label={mood}>{icon}</span>;
}

FeedbackIcon.defaultProps = { mood: 'neutral' };
FeedbackIcon.propTypes = { mood: PropTypes.string };

export default FeedbackIcon;
