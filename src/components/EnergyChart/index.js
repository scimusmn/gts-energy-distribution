/* eslint no-console: 0 */
import React, { Component } from 'react';
import propTypes from 'prop-types';
import { Line } from 'react-chartjs-2';

class EnergyChart extends Component {
  constructor(props) {
    super(props);

    this.chartRef = React.createRef();
  }

  componentDidMount() {
    this.updateChartData();
  }

  shouldComponentUpdate() {
    return true;
  }

  onAnimationFrame() {
    this.updateChartData();
  }

  updateChartData() {
    const { chartData } = this.props;
    const { datasets } = this.chartRef.current.chartInstance.config.data;

    // Show total production
    datasets[0].data = chartData.total;

    this.chartRef.current.chartInstance.update({
      preservation: true,
    });
  }

  render() {
    const {
      chartData, yAxisMin, yAxisMax,
    } = this.props;
    const { demand, timeLabels } = chartData;

    const demandData = [];

    if (demand) {
      for (let i = 0; i < demand.length; i += 1) {
        demandData.push(demand[i]);
      }
    }

    const datasets = [
      {
        label: 'Production',
        data: [],
        fill: true,
        borderWidth: 2,
        backgroundColor: 'rgba(20, 85, 255, 0.7)',
        borderColor: 'rgba(20, 85, 255, 1.0)',
        yAxisID: 'production',
      },
      {
        label: 'Demand',
        data: demandData,
        fill: false,
        backgroundColor: 'rgba(0,0,0,0.0)',
        borderColor: 'rgba(0,0,0,0.7)',
        borderDash: [10, 5],
      },
    ];

    const data = {
      labels: timeLabels,
      datasets,
    };

    const options = {
      animation: {
        duration: 750,
      },
      legend: {
        display: true,
        position: 'left',
        fill: false,
        labels: {
          fontSize: 28,
          fontFamily: 'National',
        },
      },
      maintainAspectRatio: true,
      elements: {
        point: {
          radius: 0,
        },
      },
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
    };

    return (
      <div className="energy-chart">
        <Line
          ref={this.chartRef}
          data={data}
          options={options}
        />
      </div>
    );
  }
}

EnergyChart.defaultProps = {
  chartData: {},
  yAxisMin: 0,
  yAxisMax: 500,
};

EnergyChart.propTypes = {
  chartData: propTypes.instanceOf(Object),
  yAxisMin: propTypes.number,
  yAxisMax: propTypes.number,
};

export default EnergyChart;
