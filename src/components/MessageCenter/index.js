import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'reactstrap';
import FeedbackIcon from './feedback-icon';

function MessageCenter({ time, message }) {
  return (
    <Container className="message-center window">
      <Row>
        <Col>
          <h2>Message center</h2>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <h6>
            {message.Body}
          </h6>
        </Col>
        <Col>
          <h1>
            <FeedbackIcon mood={message.Mood} />
          </h1>
        </Col>
        <Col>
          <h1>
            {time}
          </h1>
        </Col>
      </Row>
    </Container>
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
