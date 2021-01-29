/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import EnergyChart from '../EnergyChart';
import { NewKey } from '../../utils';
import FeedbackIcon from '../MessageCenter/feedback-icon';

const ScoreScreen = ({ efficiencyScore, chartData, customerFeedback }) => (
  <Container className="score-screen window">
    <Row>
      <Col>
        <h1>How did you do?</h1>
      </Col>
    </Row>
    <hr />
    <Row>
      <Col>
        <h4>Final efficiency score</h4>
        <h1 className="large">{efficiencyScore.toFixed(1)}</h1>
      </Col>
      <Col>
        <h4>Energy produced</h4>
        <h1>[Pie chart goes here]</h1>
      </Col>
    </Row>
    <br />
    <br />
    <Row>
      <Col>
        <h4>Customer approval</h4>
        <div className="customer-approval window">
          {customerFeedback.map((feedback) => (
            <FeedbackIcon
              key={NewKey()}
              mood={feedback.Mood}
            />
          ))}
        </div>
      </Col>
      <Col>
        <h4>Demand</h4>
        <EnergyChart chartData={chartData} isLive={false} />
      </Col>
    </Row>
    <hr />
    <Row>
      <Col>
        <h2>
          Press
          {' '}
          <strong>Start</strong>
          {' '}
          button to try again.
        </h2>
      </Col>
    </Row>
  </Container>
);

ScoreScreen.defaultProps = {
  chartData: {},
  customerFeedback: [],
  efficiencyScore: 0.0,
};

ScoreScreen.propTypes = {
  efficiencyScore: PropTypes.number,
  chartData: PropTypes.instanceOf(Object),
  customerFeedback: PropTypes.instanceOf(Array),
};

export default ScoreScreen;
