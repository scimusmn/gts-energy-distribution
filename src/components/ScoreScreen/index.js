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
    <ModalBody style={{ padding: 50 }}>
      {{
        // First slide
        score1: (
          <div>
            {ScoreScreen.failMode(feedbackMessage)
              ? <h1 style={{ color: '#fc3a43' }}>GAME OVER!</h1>
              : <h1>Congratulations!</h1>}
            <h2>{feedbackMessage}</h2>
            <br />
            <br />
            <Row>
              <Col className="customer-approval">
                <h3>
                  <span className="caret-sm" style={ScoreScreen.failMode(feedbackMessage) ? { color: '#fc3a43' } : { color: '#fcc523' }}>&gt;&gt;</span>
                  Customer Approval
                  <span className="caret-sm" style={ScoreScreen.failMode(feedbackMessage) ? { color: '#fc3a43' } : { color: '#fcc523' }}>&lt;&lt;</span>
                </h3>
                <div style={{ display: 'flex', marginTop: '30px' }}>
                  <div style={{ position: 'relative', left: '35px' }}>
                    <FeedbackCounter mood="angry" customerFeedback={customerFeedback} />
                  </div>
                  <div style={{ position: 'relative', left: '35px' }}>
                    <FeedbackCounter mood="neutral" customerFeedback={customerFeedback} />
                  </div>
                  <div style={{ position: 'relative', left: '35px' }}>
                    <FeedbackCounter mood="happy" customerFeedback={customerFeedback} />
                  </div>
                </div>
              </Col>
              <Col className="how-you-did">
                <h3>
                  <span className="caret-sm" style={ScoreScreen.failMode(feedbackMessage) ? { color: '#fc3a43' } : { color: '#fcc523' }}>&gt;&gt;</span>
                  How you did
                  <span className="caret-sm" style={ScoreScreen.failMode(feedbackMessage) ? { color: '#fc3a43' } : { color: '#fcc523' }}>&lt;&lt;</span>
                </h3>
                <div>
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
                </div>
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
            <ProductionPie data={chartData} />
            <EnergyChart
              chartData={chartData}
              yAxisMax={Settings.MAX_EXPECTED_DEMAND}
            />
            <ContinuePrompt />
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
    || feedbackMessage.includes('failed')
    || feedbackMessage.includes('did not provide')) {
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
