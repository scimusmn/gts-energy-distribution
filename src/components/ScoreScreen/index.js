/* eslint-disable react/jsx-props-no-spreading */
/* eslint no-param-reassign: 0 */
import React from 'react';
import {
  Modal, ModalBody, Col, Row,
} from 'reactstrap';
import { StaticImage } from 'gatsby-plugin-image';
import PropTypes from 'prop-types';
import EnergyChart from '../EnergyChart';
// import FeedbackIcon from '../MessageCenter/feedback-icon';
import Settings from '../../data/settings';
import ContinuePrompt from './continue-prompt';
import FeedbackCounter from './feedback-counter';
import ProductionPie from './production-pie';

const ScoreScreen = ({
  currentView, feedbackMessage, efficiencyScore, chartData, customerFeedback,
}) => {
  let happy = 0;
  let angry = 0;
  const angryMultiplier = 60;
  const happyMultiplier = 100;
  for (let i = 0; i < customerFeedback.length; i += 1) {
    if (customerFeedback[i].Mood === 'angry') angry += 1;
    if (customerFeedback[i].Mood === 'happy') happy += 1;
  }
  const score = Math.round(((angryMultiplier * angry) + (happyMultiplier * happy))
  / customerFeedback.length);
  let size = 'xl';
  if (currentView === 'score3') size = 'lg';
  return (
    <Modal isOpen size={size} className={`score-screen pane ${ScoreScreen.failMode(feedbackMessage) ? 'failed' : ''}`}>
      <ModalBody modalClassName="custom-modal-style" style={currentView === 'score2' ? { padding: '0px', margin: '80px' } : {}}>
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
                  <div className="feedback-counter-outer">
                    <FeedbackCounter mood="angry" customerFeedback={customerFeedback} />
                    {/* <FeedbackCounter mood="neutral" customerFeedback={customerFeedback} /> */}
                    <FeedbackCounter mood="happy" customerFeedback={customerFeedback} />
                  </div>
                </Col>
                <Col className="how-you-did">
                  <h3>
                    <span className="caret-sm" style={ScoreScreen.failMode(feedbackMessage) ? { color: '#fc3a43' } : { color: '#fcc523' }}>&gt;&gt;</span>
                    How you did
                    <span className="caret-sm" style={ScoreScreen.failMode(feedbackMessage) ? { color: '#fc3a43' } : { color: '#fcc523' }}>&lt;&lt;</span>
                  </h3>
                  <div>
                    <h2 style={{ fontWeight: 900, marginTop: '20px' }}>
                      {score}
                      {' '}
                      points!
                    </h2>
                    {/* <FeedbackIcon mood={customerFeedback.reduce((totals, feedback, index) => {
                      totals[feedback.Mood] = (totals[feedback.Mood] || 0) + 1;
                      if (index === customerFeedback.length - 1) {
                        // Return mood label of highest count
                        return Object.keys(totals)
                          .reduce((a, b) => (totals[a] > totals[b] ? a : b));
                      }
                      return totals;
                    }, {})}
                    /> */}
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
            <>
              <div className="prod-container">
                <ProductionPie data={chartData} />
                <div>
                  <h3 className="prod-label">
                    <span className="caret-sm-2" style={ScoreScreen.failMode(feedbackMessage) ? { color: '#fc3a43' } : { color: '#fcc523' }}>&gt;&gt;</span>
                    Prouction Breakdown
                  </h3>
                  <div className="icon-box" style={{ marginLeft: '150px' }}>
                    <div className="icon-container">
                      <StaticImage src="../../images/coal-icon.png" alt="" height={75} />
                      <h3>Coal</h3>
                    </div>
                    <div className="icon-container">
                      <StaticImage src="../../images/solar-icon.png" alt="" height={75} />
                      <h3 style={{ marginLeft: '20px' }}>Solar</h3>
                    </div>
                    <div className="icon-container">
                      <StaticImage src="../../images/wind-icon.png" alt="" height={75} />
                      <h3>Wind</h3>
                    </div>
                  </div>
                  <div className="icon-box" style={{ marginTop: '20px', marginLeft: '150px' }}>
                    <div className="icon-container">
                      <StaticImage src="../../images/gas-icon.png" alt="" height={75} />
                      <h3>Natural gas</h3>
                    </div>
                    <div className="icon-container">
                      <StaticImage src="../../images/hydro-icon.png" alt="" height={75} />
                      <h3>Hydroelectric</h3>
                    </div>
                  </div>
                </div>
              </div>
              <br />
              <div className="chart-container">
                <h3 className="demand-label">
                  <span className="caret-sm-2" style={ScoreScreen.failMode(feedbackMessage) ? { color: '#fc3a43', left: '330px' } : { color: '#fcc523', left: '330px' }}>&gt;&gt;</span>
                  Demand
                </h3>
                <EnergyChart
                  chartData={chartData}
                  yAxisMax={Settings.MAX_EXPECTED_DEMAND}
                />
                <div className="hide-legend">
                  <table>
                    <tr>
                      <td>
                        <div className="demand-key">
                          ---
                        </div>
                      </td>
                      <td>
                        <h3>Demand</h3>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="prod-key" />
                      </td>
                      <td>
                        <h3 className="prod-label">
                          Production
                        </h3>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <br />
              <br />
              <ContinuePrompt />
            </>),
          // Third slide
          score3: (
            <div>
              <br />
              <StaticImage src="../../images/powerplant.png" alt="" />
              <br />
              <h2>
                Do you think you can do&nbsp;better?
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
};

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
