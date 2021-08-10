/* eslint-disable react/jsx-props-no-spreading */
/* eslint no-param-reassign: 0 */

import React from 'react';
import {
  Modal, ModalBody, Col, Row,
} from 'reactstrap';
import { StaticImage } from 'gatsby-plugin-image';
import PropTypes from 'prop-types';
import EnergyChart from '../EnergyChart';
import FeedbackIcon from '../MessageCenter/feedback-icon';
import Settings from '../../data/settings';
import ContinuePrompt from './continue-prompt';
import FeedbackCounter from './feedback-counter';
import ProductionPie from './production-pie';

const ScoreScreen = ({
  currentView, feedbackMessage, efficiencyScore, chartData, customerFeedback,
}) => (
  <Modal isOpen size="xl" className={`score-screen pane ${ScoreScreen.failMode(feedbackMessage) ? 'failed' : ''}`}>
    <ModalBody>
      {{
        // First slide
        score1: (
          <div>
            {ScoreScreen.failMode(feedbackMessage)
              ? <h1>GAME OVER!</h1>
              : <h1>Congratulations!</h1>}
            <h2>{feedbackMessage}</h2>
            <br />
            <br />
            <Row>
              <Col>
                <h2>Customer Approval</h2>
                <br />
                <Row className="customer-approval">
                  <Col>
                    <FeedbackCounter mood="angry" customerFeedback={customerFeedback} />
                  </Col>
                  <Col>
                    <FeedbackCounter mood="neutral" customerFeedback={customerFeedback} />
                  </Col>
                  <Col>
                    <FeedbackCounter mood="happy" customerFeedback={customerFeedback} />
                  </Col>
                </Row>
              </Col>
              <Col className="how-you-did">
                <h2>How you did</h2>
                <br />
                <Row>
                  <Col>
                    <FeedbackIcon mood={customerFeedback.reduce((totals, feedback, index) => {
                      totals[feedback.Mood] = (totals[feedback.Mood] || 0) + 1;
                      if (index === customerFeedback.length - 1) {
                        // Return mood label of highest count
                        return Object.keys(totals)
                          .reduce((a, b) => (totals[a] > totals[b] ? a : b));
                      }
                      return totals;
                    }, {})}
                    />
                    <h4 style={{ display: 'none' }}>
                      {Math.ceil(efficiencyScore * 100)}
                      %
                    </h4>
                  </Col>
                </Row>
              </Col>
            </Row>
            <br />
            <br />
            <ContinuePrompt />
            <br />
          </div>),
        // Second slide
        score2: (
          <div>
            <br />
            <h2>Production Breakdown</h2>
            <ProductionPie data={chartData} />
            <br />
            <br />
            <h2>Demand</h2>
            <EnergyChart
              chartData={chartData}
              yAxisMax={Settings.MAX_EXPECTED_DEMAND}
            />
            <br />
            <br />
            <ContinuePrompt />
            <br />
          </div>),
        // Third slide
        score3: (
          <div>
            <br />
            <StaticImage src="../../images/powerplant.png" alt="" />
            <br />
            <h2>
              Do you think you can do better?
            </h2>
            <br />
            <br />
            <ContinuePrompt />
            <br />
          </div>),
      }[currentView]}
    </ModalBody>
  </Modal>
);

ScoreScreen.failMode = (feedbackMessage) => {
  if (feedbackMessage.includes('blackout')
    || feedbackMessage.includes('Game over')) {
    return true;
  }
  return false;
};

ScoreScreen.defaultProps = {
  feedbackMessage: 'How did you do?',
  chartData: {},
  customerFeedback: [],
  efficiencyScore: 0.0,
};

ScoreScreen.propTypes = {
  currentView: PropTypes.string.isRequired,
  feedbackMessage: PropTypes.string,
  efficiencyScore: PropTypes.number,
  chartData: PropTypes.instanceOf(Object),
  customerFeedback: PropTypes.instanceOf(Array),
};

export default ScoreScreen;
