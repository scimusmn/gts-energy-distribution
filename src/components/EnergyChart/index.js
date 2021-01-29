/* eslint no-console: 0 */
import React, { Component } from 'react';
import propTypes from 'prop-types';
import { Line } from 'react-chartjs-2';

class EnergyChart extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };

    this.chartRef = React.createRef();

    this.latestData = {};
  }

  componentDidMount() {
    const { isLive } = this.props;
    if (isLive) {
      // TODO: Replace this interval with a requestAnimationFrame hook.
      setInterval(() => {
        this.updateChartData();
      }, 33);
    } else {
      // Only update/render once
      this.updateChartData();
    }
  }

  shouldComponentUpdate() {
    return true;
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
    console.log('rendering chart');
    const { chartData } = this.props;
    const { demand } = chartData;

    const labels = [];
    const demandData = [];

    let highestDemand = 0;

    if (demand) {
      for (let i = 0; i < demand.length; i += 1) {
        const demandVal = demand[i];
        demandData.push(demandVal);
        labels.push(`h${i}`);
        if (demandVal > highestDemand) highestDemand = demandVal;
      }
    }

    const yAxisMin = 0;
    const yAxisMax = parseFloat(highestDemand) + 10;

    // Temp - these are no longer needed
    const coalData = [1, 5, 3, 5, 2, 5];
    const gasData = [1, 5, 3, 5, 2, 5];
    const hydroData = [1, 2, 3, 4, 5, 6];
    const solarData = [1, 3, 5, 7, 5, 1];
    const windData = [1, 3, 5, 7, 5, 1];

    const data = {
      labels,
      datasets: [
        {
          label: 'Coal',
          data: coalData,
          fill: true,
          borderWidth: 0,
          backgroundColor: 'yellow',
          borderColor: 'rgba(0,0,0,0)',
          yAxisID: 'production',
        },
        {
          label: 'Gas',
          data: gasData,
          fill: true,
          borderWidth: 0,
          backgroundColor: 'orange',
          borderColor: 'rgba(0,0,0,0)',
          yAxisID: 'production',
        },
        {
          label: 'Hydro',
          data: hydroData,
          fill: true,
          borderWidth: 0,
          backgroundColor: 'teal',
          borderColor: 'rgba(0,0,0,0)',
          yAxisID: 'production',
        },
        {
          label: 'Solar',
          data: solarData,
          fill: true,
          borderWidth: 0,
          backgroundColor: 'purple',
          borderColor: 'rgba(0,0,0,0)',
          yAxisID: 'production',
        },
        {
          label: 'Wind',
          data: windData,
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
        duration: 0,
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
};

export default EnergyChart;
