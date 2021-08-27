import React from 'react';
/* eslint-disable */
import Simulation from '@components/Simulation';
import ScoreScreen from '@components/ScoreScreen';
// import MessageCenter from '@components/MessageCenter';
// import Messages from '../data/message-center.json';
import DummyChartData from '../data/dummy-chart-data';
/* eslint-disable */
const IndexPage = () => (
  <>
  <ScoreScreen
    currentView="score3"
    chartData={DummyChartData.SUCCESS}
    feedbackMessage="success message here"
  />
  </>
);

export default IndexPage;
// <Simulation />

// <ScoreScreen
//   currentView="score1"
//   chartData={DummyChartData.BLACKOUT}
//   feedbackMessage="failed message here"
// />
// <ScoreScreen
//   currentView="score2"
//   chartData={DummyChartData.BLACKOUT}
//   feedbackMessage="failed message here"
// />
// <ScoreScreen
//   currentView="score1"
//   chartData={DummyChartData.SUCCESS}
//   feedbackMessage="congrats message here"
// />
// <ScoreScreen
//   currentView="score2"
//   chartData={DummyChartData.SUCCESS}
//   feedbackMessage="congrats message here"
// />
// <MessageCenter
//   message={Messages[16]}
// />
