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
}) => {
  console.log(currentView);
  return (
    <Modal isOpen size="xl" modalClassName="custom-modal-style" className={`score-screen pane ${ScoreScreen.failMode(feedbackMessage) ? 'failed' : ''}`}>
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
            <>
              <div className="prod-container">
                <ProductionPie data={chartData} />
                <div>
                  <h3 style={{ position: 'relative', left: '-150px', top: '-20px' }}>
                    <span className="caret-sm-2" style={ScoreScreen.failMode(feedbackMessage) ? { color: '#fc3a43' } : { color: '#fcc523' }}>&gt;&gt;</span>
                    Prouction Breakdown
                  </h3>
                  <div className="icon-box" style={{ marginLeft: '150px' }}>
                    <div style={{ display: 'flex' }}>
                      <StaticImage src="../../images/coal-icon.png" alt="" height={75} />
                      <h3 style={{ marginLeft: '20px' }}>Coal</h3>
                    </div>
                    <div style={{ display: 'flex', marginLeft: '20px' }}>
                      <StaticImage src="../../images/solar-icon.png" alt="" height={75} />
                      <h3 style={{ marginLeft: '20px' }}>Solar</h3>
                    </div>
                    <div style={{ display: 'flex', marginLeft: '20px' }}>
                      <StaticImage src="../../images/wind-icon.png" alt="" height={75} />
                      <h3 style={{ marginLeft: '20px' }}>Wind</h3>
                    </div>
                  </div>
                  <div className="icon-box" style={{ marginTop: '20px', marginLeft: '150px' }}>
                    <div style={{ display: 'flex' }}>
                      <StaticImage src="../../images/gas-icon.png" alt="" height={75} />
                      <h3 style={{ marginLeft: '20px' }}>Natural gas</h3>
                    </div>
                    <div style={{ display: 'flex', marginLeft: '20px' }}>
                      <StaticImage src="../../images/hydro-icon.png" alt="" height={75} />
                      <h3 style={{ marginLeft: '20px' }}>Hydroelectric</h3>
                    </div>
                  </div>
                </div>
              </div>
              <br />
              <div style={{ border: '2px solid gray', borderRadius: '20px' }}>
                <h3 style={{ position: 'relative', left: '-230px', top: '25px' }}>
                  <span className="caret-sm-2" style={ScoreScreen.failMode(feedbackMessage) ? { color: '#fc3a43', left: '250px' } : { color: '#fcc523', left: '250p' }}>&gt;&gt;</span>
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
                        <div style={{
                          width: '50px', height: '50px', position: 'relative', top: '-6px', fontSize: '40px',
                        }}
                        >
                          ---
                        </div>
                      </td>
                      <td>
                        <h3>Demand</h3>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div style={{
                          width: '40px', height: '40px', backgroundColor: 'rgba(20, 85, 255, 0.7)',
                        }}
                        />
                      </td>
                      <td>
                        <h3 style={{ position: 'relative', left: '20px' }}>
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
