import React from 'react';
// import Moment from 'react-moment';
import PropTypes from 'prop-types';
import FeedbackIcon from './feedback-icon';

function MessageCenter({ time, message }) {
  return (
    <div className="message-center window">
      <h3>Message Center</h3>
      <h4>
        <FeedbackIcon mood={message.Mood} />
      </h4>
      <p>{message.Body}</p>
      <h4>
        Time:
        {' '}
        {/* <Moment date={time} format="hh:mm" /> */}
        <br />
        {time}
      </h4>
    </div>
  );
}

MessageCenter.defaultProps = {
  time: '0:00',
  message: {},
};

MessageCenter.propTypes = {
  time: PropTypes.string,
  message: PropTypes.instanceOf(Object),
};

export default MessageCenter;
