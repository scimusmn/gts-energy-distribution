/* eslint no-console: 0 */
import React, { Component } from 'react';
import propTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import withAnimationFrame from '../AnimationFrameHOC';

class EnergyChart extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };

    this.chartRef = React.createRef();
    this.onAnimationFrame = this.onAnimationFrame.bind(this);

    this.latestData = {};
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
    datasets[0].data = chartData.coal;
    datasets[1].data = chartData.gas;
    datasets[2].data = chartData.hydro;
    datasets[3].data = chartData.solar;
    datasets[4].data = chartData.wind;

    this.chartRef.current.chartInstance.update({
      preservation: true,
    });
  }

  render() {
    const { chartData, isLive } = this.props;
    const { demand, timeLabels } = chartData;

    const demandData = [];

    let highestDemand = 0;

    if (demand) {
      for (let i = 0; i < demand.length; i += 1) {
        const demandVal = demand[i];
        demandData.push(demandVal);
        if (demandVal > highestDemand) highestDemand = demandVal;
      }
    }

    const yAxisMin = 0;
    const yAxisMax = parseFloat(highestDemand) + 10;

    const data = {
      labels: timeLabels,
      datasets: [
        {
          label: 'Coal',
          data: [],
          fill: true,
          borderWidth: 0,
          backgroundColor: 'yellow',
          borderColor: 'rgba(0,0,0,0)',
          yAxisID: 'production',
        },
        {
          label: 'Gas',
          data: [],
          fill: true,
          borderWidth: 0,
          backgroundColor: 'orange',
          borderColor: 'rgba(0,0,0,0)',
          yAxisID: 'production',
        },
        {
          label: 'Hydro',
          data: [],
          fill: true,
          borderWidth: 0,
          backgroundColor: 'teal',
          borderColor: 'rgba(0,0,0,0)',
          yAxisID: 'production',
        },
        {
          label: 'Solar',
          data: [],
          fill: true,
          borderWidth: 0,
          backgroundColor: 'purple',
          borderColor: 'rgba(0,0,0,0)',
          yAxisID: 'production',
        },
        {
          label: 'Wind',
          data: [],
          fill: true,
          borderWidth: 0,
          backgroundColor: 'red',
          borderColor: 'rgba(0,0,0,0)',
          yAxisID: 'production',
        },
        {
          label: 'Demand',
          data: demandData,
          fill: false,
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderColor: 'rgba(0,0,0,0.7)',
          borderDash: [10, 5],
        },
      ],
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
};

EnergyChart.propTypes = {
  chartData: propTypes.instanceOf(Object),
  isLive: propTypes.bool,
  setAnimationFrameCallback: propTypes.instanceOf(Function).isRequired,
};

export default withAnimationFrame(EnergyChart);
