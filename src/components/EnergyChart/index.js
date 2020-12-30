/* eslint no-console: 0 */
import React, { Component, Fragment } from 'react';
// import propTypes from 'prop-types';
import ChartComponent from 'react-chartjs-2';

class EnergyChart extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };

    this.chartReference = {};

    this.resetGraph = this.resetGraph.bind(this);

    this.latestData = {};
  }

  componentDidMount() {
    // setInterval(() => {
    //   const { graphing } = this.state;

    //   if (graphing) {
    //     this.chartReference.chartInstance.config.data.datasets[0].data.push(this.latestData);

    //     this.chartReference.chartInstance.update({
    //       preservation: true,
    //     });
    //   }
    // }, 20);
  }

  shouldComponentUpdate() {
    // return true;
  }

  onSerialData(data) {
    const { message, graphing } = this.state;

    if (graphing) {
      if (this.chartReference.chartInstance.config.options.plugins.streaming.pause) {
        this.resetGraph();
      }

      this.chartReference.chartInstance.config.options.plugins.streaming.pause = false;
    }

    if (data.message === 'time-up') {
      this.chartReference.chartInstance.config.options.plugins.streaming.pause = true;
      // this.setState({ graphing: false });
    }

    if (data.message === message
      && !this.chartReference.chartInstance.config.options.plugins.streaming.pause) {
      this.latestData = {
        x: Date.now(),
        y: data.value * 10,
      };
    }
  }

  getChartOptions() {
    const { gridColor, yMax, yMin } = this.state;
    const chartOptions = {
      animation: {
        duration: 0,
      },
      hover: {
        animationDuration: 0,
      },
      legend: {
        display: false,
      },
      maintainAspectRatio: false,
      responsiveAnimationDuration: 0,
      plugins: {
        streaming: {
          delay: 0,
          duration: 5000,
          frameRate: 20,
          pause: false,
          refresh: 100,
          ttl: 5000,
        },
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              color: gridColor,
            },
            ticks: {
              display: false,
            },
            type: 'realtime',
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: gridColor,
            },
            ticks: {
              display: false,
              max: yMax,
              min: yMin,
              stepSize: 200,
            },
          },
        ],
      },
      spanGaps: true,
    };

    return chartOptions;
  }

  resetGraph() {
    this.chartReference.chartInstance.config.data.datasets[0].data = [];
    this.chartReference.chartInstance.update();
  }

  render() {
    const {
      backgroundColor, borderColor, type, graphing,
    } = this.state;

    const graphClass = (graphing) ? 'chart-wrapper' : 'chart-wrapper d-none';
    const graphData = {
      datasets: [{
        backgroundColor,
        borderColor,
        borderWidth: 1,
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }],
    };

    return (
      <>
        <div className={graphClass}>
          <ChartComponent
            data={graphData}
            options={this.getChartOptions()}
            ref={(reference) => { this.chartReference = reference; }}
            type={type}
          />
        </div>
      </>
    );
  }
}

// EnergyChart.propTypes = {
//   backgroundColor: propTypes.string,
//   borderColor: propTypes.string,
//   gridColor: propTypes.string,
//   message: propTypes.string.isRequired,
//   setOnDataCallback: propTypes.func.isRequired,
//   graphing: propTypes.bool.isRequired,
//   type: propTypes.string,
//   yMax: propTypes.number,
//   yMin: propTypes.number,
// };

// EnergyChart.defaultProps = {
//   backgroundColor: 'rgb(255, 99, 132)',
//   borderColor: 'rgb(255, 99, 132)',
//   gridColor: 'rgb(0, 0, 0)',
//   type: 'bar',
//   yMax: 1,
//   yMin: 0,
// };

export default EnergyChart;
