import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Row } from 'reactstrap';
import FeedbackIcon from './feedback-icon';

function MessageCenter({ message }) {
  const [messageClass, setMessageClass] = useState('');

  useEffect(() => {
    setMessageClass('pop-in');
    const transitionTimer = setTimeout(() => setMessageClass(''), 3000);
    return () => clearTimeout(transitionTimer);
  }, [message]);

  return (
    <Container className="message-center pane window">
      <Row>
        <h2>
          <span className="pane-chevron" />
          <span className="pane-chevron-title">
            Message Center
          </span>
        </h2>
      </Row>
      <Row>
        <FeedbackIcon mood={message.Mood} />
      </Row>
      <Row className={`message-container ${messageClass}`}>
        <h3 className="message-body">
          {message.Body}
        </h3>
      </Row>
    </Container>
  );
}

MessageCenter.defaultProps = {
  message: {},
};

MessageCenter.propTypes = {
  message: PropTypes.instanceOf(Object),
};

export default MessageCenter;
