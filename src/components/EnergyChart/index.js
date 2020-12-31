/* eslint no-console: 0 */
import React, { Component } from 'react';
import propTypes from 'prop-types';
import { Line } from 'react-chartjs-2';

class EnergyChart extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };

    this.chartReference = {};

    this.latestData = {};
  }

  componentDidMount() {
    // Temp
    const { data } = this.props;
    console.log('componentDidMount', data);

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

  render() {
    // const {
    //   backgroundColor, borderColor, type, graphing,
    // } = this.state;


    const data = {
      labels: ['1', '2', '3', '4', '5', '6'],
      datasets: [
        {
          label: 'shoulders',
          data: [1, 5, 3, 5, 2, 5],
          fill: true,
          backgroundColor: 'yellow',
          yAxisID: 'production',
        },
        {
          label: 'feet',
          data: [3, 4, 5, 6, 7, 8],
          fill: true,
          backgroundColor: 'purple',
          yAxisID: 'production',
        },
        {
          label: 'hands',
          data: [1, 1, 5, 1, 5, 7],
          fill: true,
          backgroundColor: 'red',
          yAxisID: 'production',
        },
        {
          label: 'Demand',
          data: [0, 7, 15, 22, 13, 1],
          fill: false,
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderColor: 'rgba(0,0,0,0.7)',
          borderDash: [10, 5],

        },
      ],
    };

    const yAxisMin = 0;
    const yAxisMax = 25;

    const options = {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              min: yAxisMin,
              max: yAxisMax,
            },
            stacked: false,
          },
          {
            id: 'production',
            stacked: true,
            display: false,
            ticks: {
              min: yAxisMin,
              max: yAxisMax,
            },
          },
        ],
      },
      elements: {
        point: {
          radius: 0,
        },
      },
    };

    return (
      <div className="energy-chart">
        <Line data={data} options={options} />
      </div>
    );
  }
}

EnergyChart.defaultProps = {
  data: {},
};

EnergyChart.propTypes = {
  data: propTypes.instanceOf(Object),
};

export default EnergyChart;
