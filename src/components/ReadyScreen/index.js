/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import Forecast from '../Forecast';

const ReadyScreen = ({ forecast }) => (
  <Container className="score-screen window">
    <Row>
      <Col>
        <h1>Ready?</h1>
      </Col>
    </Row>
    <hr />
    <Row>
      <Col>
        <Forecast days={forecast} />
      </Col>
    </Row>
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <hr />
    <Row>
      <Col>
        <h1>
          Press
          {' '}
          <strong>Start</strong>
          {' '}
          button to begin.
        </h1>
      </Col>
    </Row>
  </Container>
);

ReadyScreen.defaultProps = {
  forecast: [],
};

ReadyScreen.propTypes = {
  forecast: PropTypes.instanceOf(Array),
};

export default ReadyScreen;
