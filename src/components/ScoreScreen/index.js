/* eslint-disable react/jsx-props-no-spreading */
/* eslint no-param-reassign: 0 */

import React from 'react';
import {
  Modal, ModalBody, Col, Row,
} from 'reactstrap';
import { StaticImage } from 'gatsby-plugin-image';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import EnergyChart from '../EnergyChart';
import ChartColors from '../EnergyChart/chart-colors';
import { SumArray } from '../../utils';
import FeedbackIcon from '../MessageCenter/feedback-icon';
import Settings from '../../data/settings';

const ScoreScreen = ({
  currentView, feedbackMessage, efficiencyScore, chartData, customerFeedback,
}) => (
  <Modal isOpen size="xl" className={`score-screen pane ${feedbackMessage.includes('blackout') ? 'failed' : ''}`}>
    <ModalBody>
      {{
        score1: (
          <div>
            {feedbackMessage.includes('blackout')
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
                    <h2>
                      <FeedbackIcon mood="angry" />
                      {' '}
                      X
                      {' '}
                      {customerFeedback.filter((obj) => obj.Mood === 'angry').length}
                    </h2>
                  </Col>
                  <Col>
                    <h2>
                      <div><FeedbackIcon mood="neutral" /></div>
                      {' '}
                      X
                      {' '}
                      {customerFeedback.filter((obj) => obj.Mood === 'neutral').length}
                    </h2>
                  </Col>
                  <Col>
                    <h2>
                      <div><FeedbackIcon mood="happy" /></div>
                      {' '}
                      X
                      {' '}
                      {customerFeedback.filter((obj) => obj.Mood === 'happy').length}
                    </h2>
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
            <h3>
              <strong>Press OK</strong>
              <br />
              to continue
            </h3>
            <br />
          </div>),
        score2: (
          <div>
            <br />
            <h2>Production Breakdown</h2>
            <Doughnut
              data={ScoreScreen.collatePieData(chartData)}
              options={ScoreScreen.PieOptions}
            />
            <br />
            <br />
            <h2>Demand</h2>
            <EnergyChart
              chartData={chartData}
              isLive={false}
              yAxisMax={Settings.MAX_EXPECTED_DEMAND}
            />
            <br />
            <br />
            <h3>
              <strong>Press OK</strong>
              <br />
              to continue
            </h3>
            <br />
          </div>),
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
            <h3>
              <strong>Press OK</strong>
              <br />
              to start over
            </h3>
            <br />
          </div>),
      }[currentView]}
    </ModalBody>
  </Modal>
);

ScoreScreen.PieOptions = {
  legend: {
    display: true,
    position: 'right',
    labels: {
      fontSize: 28,
      fontFamily: 'National',
    },
  },
  elements: {
    arc: {
      borderWidth: 0,
    },
  },
};

ScoreScreen.collatePieData = (energyData) => {
  const labels = ['Coal', 'Natural gas', 'Hydro', 'Solar', 'Wind'];

  const {
    coal, gas, hydro, solar, wind,
  } = energyData;

  const energySums = [
    SumArray(coal),
    SumArray(gas),
    SumArray(hydro),
    SumArray(solar),
    SumArray(wind),
  ];

  const pieData = {
    maintainAspectRatio: false,
    responsive: false,
    labels,
    datasets: [
      {
        data: energySums,
        backgroundColor: ChartColors,
        hoverBackgroundColor: ChartColors,
      },
    ],
  };

  return pieData;
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
