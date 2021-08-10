
import React from 'react';
import PropTypes from 'prop-types';
import FeedbackIcon from '../MessageCenter/feedback-icon';

const FeedbackCounter = ({
  customerFeedback, mood,
}) => (
  <h2>
    <FeedbackIcon mood={mood} />
    {' '}
    X
    {' '}
    {/* Count messages matching moood triggered during simulation */}
    {customerFeedback.filter((obj) => obj.Mood === mood).length}
  </h2>

);

FeedbackCounter.defaultProps = {
  customerFeedback: [],
};

FeedbackCounter.propTypes = {
  mood: PropTypes.string.isRequired,
  customerFeedback: PropTypes.instanceOf(Array),
};

export default FeedbackCounter;
