/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import EnergyChart from '../EnergyChart';
import ChartColors from '../EnergyChart/chart-colors';
import { NewKey, SumArray } from '../../utils';
import FeedbackIcon from '../MessageCenter/feedback-icon';

const ScoreScreen = ({ efficiencyScore, chartData, customerFeedback }) => (
  <Container className="modal-screen window">
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
        <Doughnut
          data={ScoreScreen.collatePieData(chartData)}
          options={ScoreScreen.PieOptions}
        />
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

  console.log('energyData');
  console.log(energyData);

  const energySums = [
    SumArray(coal),
    SumArray(gas),
    SumArray(hydro),
    SumArray(solar),
    SumArray(wind),
  ];

  console.log('energySums');
  console.log(energySums);

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
