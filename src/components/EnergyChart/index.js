/* eslint no-console: 0 */
import React, { Component } from 'react';
import propTypes from 'prop-types';
import { Line, Chart } from 'react-chartjs-2';
import withAnimationFrame from '../AnimationFrameHOC';
// import ChartColors from './chart-colors';

class EnergyChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.chartRef = React.createRef();
    this.onAnimationFrame = this.onAnimationFrame.bind(this);

    this.latestData = {};

    const { isLive } = props;

    if (isLive) {
      Chart.pluginService.register({
        afterDraw(chart) {
          // Draw vertical line at most recent production data point.
          /* eslint no-underscore-dangle: 0 */
          const metadata = chart.data.datasets[0]._meta['0'];
          if (metadata) {
            const { data } = metadata;
            if (data.length > 0) {
              const topY = chart.scales['y-axis-0'].top;
              const bottomY = chart.scales['y-axis-0'].bottom;
              const lineX = data[data.length - 1]._model.x;

              const { ctx } = chart;
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(lineX, topY);
              ctx.lineTo(lineX, bottomY);
              ctx.lineWidth = 2;
              ctx.strokeStyle = '#e23fa9';
              ctx.stroke();
              ctx.restore();
            }
          }
        },
      });
    }
  }

  componentDidMount() {
    const { isLive, setAnimationFrameCallback } = this.props;
    if (isLive) {
      // HOC function
      setAnimationFrameCallback(this.onAnimationFrame);
    } else {
      // Only update/render once
      this.updateChartData();
    }
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
      chartData, isLive, yAxisMin, yAxisMax,
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
        duration: (!isLive ? 750 : 0),
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
  isLive: true,
  yAxisMin: 0,
  yAxisMax: 500,
};

EnergyChart.propTypes = {
  chartData: propTypes.instanceOf(Object),
  isLive: propTypes.bool,
  yAxisMin: propTypes.number,
  yAxisMax: propTypes.number,
  setAnimationFrameCallback: propTypes.instanceOf(Function).isRequired,
};

export default withAnimationFrame(EnergyChart);
