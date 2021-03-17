import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'reactstrap';
import FeedbackIcon from './feedback-icon';

function MessageCenter({ time, message }) {
  const [messageClass, setMessageClass] = useState('');

  useEffect(() => {
    setMessageClass('pop-in');
    const transitionTimer = setTimeout(() => setMessageClass(''), 3000);
    return () => clearTimeout(transitionTimer);
  }, [message]);

  return (
    <Container className="message-center window">
      <Row>
        <Col>
          <h2>Message center</h2>
          <h1 style={{ display: 'none' }}>
            {time}
          </h1>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col className={`message-container ${messageClass}`}>
          <h2 className="message-body">
            {message.Body}
          </h2>
          <br />
          <h1>
            <FeedbackIcon mood={message.Mood} />
          </h1>
        </Col>
      </Row>
    </Container>
  );
}

MessageCenter.defaultProps = {
  time: 0,
  message: {},
};

MessageCenter.propTypes = {
  time: PropTypes.number,
  message: PropTypes.instanceOf(Object),
};

export default MessageCenter;
