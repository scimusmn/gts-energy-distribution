import React from 'react';
import PropTypes from 'prop-types';

function FeedbackIcon({ mood }) {
  // let icon = '🙂';
  let icon = ' ';
  if (mood === 'angry') {
    // icon = '😠';
    icon = ' ';
  } else if (mood === 'happy') {
    // icon = '😍';
    icon = ' ';
  }

  return <span role="img" className={`feedback-icon ${mood}`} aria-label={mood}>{icon}</span>;
}

FeedbackIcon.defaultProps = { mood: 'neutral' };
FeedbackIcon.propTypes = { mood: PropTypes.string };

export default FeedbackIcon;
