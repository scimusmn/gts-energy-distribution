
import React from 'react';
import PropTypes from 'prop-types';
import FeedbackIcon from '../MessageCenter/feedback-icon';

const FeedbackCounter = ({
  customerFeedback, mood,
}) => (
  <div>
    <FeedbackIcon mood={mood} />
    <h2 style={{ fontSize: '30px', top: '15px', position: 'relative' }}>
      x
      {' '}
      {/* Count messages matching moood triggered during simulation */}
      {customerFeedback.filter((obj) => obj.Mood === mood).length }
    </h2>
  </div>
);

FeedbackCounter.defaultProps = {
  customerFeedback: [],
};

FeedbackCounter.propTypes = {
  mood: PropTypes.string.isRequired,
  customerFeedback: PropTypes.instanceOf(Array),
};

export default FeedbackCounter;
