/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Modal, ModalBody, Col,
} from 'reactstrap';
import { StaticImage } from 'gatsby-plugin-image';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import EnergyChart from '../EnergyChart';
import ChartColors from '../EnergyChart/chart-colors';
import { NewKey, SumArray } from '../../utils';
import FeedbackIcon from '../MessageCenter/feedback-icon';
import Settings from '../../data/settings';

const ScoreScreen = ({
  currentView, feedbackMessage, efficiencyScore, chartData, customerFeedback,
}) => (
  <Modal isOpen size="xl" className="score-screen pane">
    <ModalBody>
      {{
        score1: (
          <div>
            {feedbackMessage.includes('blackout')
              ? <h1>Blackout.</h1>
              : <h1>Congratulations!</h1>}
            <h2>{feedbackMessage}</h2>
            <br />
            <br />
            <Col>
              <h3>Customer Approval</h3>
              <br />
              <div className="customer-approval">
                {customerFeedback.map((feedback) => (
                  <FeedbackIcon
                    key={NewKey()}
                    mood={feedback.Mood}
                  />
                ))}
              </div>
              <h1 className="billboard-score" style={{ display: 'none' }}>
                {Math.ceil(efficiencyScore * 100)}
                %
              </h1>
            </Col>
            <br />
            <br />
            <h3>Continue?</h3>
            <h4>PRESS OK.</h4>
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
            <h3>Continue?</h3>
            <h4>PRESS OK.</h4>
            <br />
          </div>),
        score3: (
          <div>
            <br />
            <StaticImage src="../../images/powerplant.png" alt="" />
            <br />
            <h2>
              Do you think you can beat your score?
            </h2>
            <br />
            <br />
            <h3>Continue?</h3>
            <h4>PRESS OK.</h4>
            <br />
          </div>),
      }[currentView]}
    </ModalBody>
  </Modal>
);

ScoreScreen.PieOptions = {
  legend: {
    display: true,
    position: 'left',
  },
  elements: {
    arc: {
      borderWidth: 0,
    },
  },
};

ScoreScreen.collatePieData = (energyData) => {
  const labels = ['Coal', 'Natural Gas', 'Hydro', 'Solar', 'Wind'];

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
