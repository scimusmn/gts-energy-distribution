/* eslint-disable */
import React, { Component } from 'react';
import CanvasJSReact from '../lib/canvasjs/canvasjs.react';

const { CanvasJSChart } = CanvasJSReact;

const dataPoints1 = [];
const dataPoints2 = [];
const updateInterval = 30;
// initial values
let yValue1 = 408;
let yValue2 = 350;
let xValue = 5;
let arduinoMsgRate = 0;
class DynamicMultiSeriesChart extends Component {
  constructor() {
    super();
    this.updateChart = this.updateChart.bind(this);
  }

  componentDidMount() {
    this.updateChart(20);
    setInterval(this.updateChart, updateInterval);
  }

  updateChart(count) {
    count = count || 1;
    for (let i = 0; i < count; i += 1) {
      xValue += 2;
      yValue1 = Math.floor(Math.random() * (408 - 400 + 1) + 400);
      yValue2 = Math.floor(Math.random() * (350 - 340 + 1) + 340);
      dataPoints1.push({
        x: xValue,
        y: yValue1,
      });
      dataPoints2.push({
        x: xValue,
        y: yValue2,
      });
      if (dataPoints1.length > 75) dataPoints1.shift();
      if (dataPoints2.length > 75) dataPoints2.shift();
    }

    this.chart.options.data[0].legendText = ` Arduino input rate - ${yValue1} msg/sec`;
    this.chart.options.data[1].legendText = ` Chart update rate - ${updateInterval} ms`;
    this.chart.render();
  }

  render() {
    const options = {
      zoomEnabled: true,
      theme: 'light2',
      title: {
        text: 'Speed of Bugatti vs Lamborghini',
      },
      axisX: {
        title: 'chart updates every 2 secs',
      },
      axisY: {
        suffix: ' km/h',
        includeZero: false,
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: 'pointer',
        verticalAlign: 'top',
        fontSize: 18,
        fontColor: 'dimGrey',
        itemclick(e) {
          if (typeof (e.dataSeries.visible) === 'undefined' || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        },
      },
      data: [
        {
          type: 'stepLine',
          xValueFormatString: '#,##0 seconds',
          yValueFormatString: '#,##0 km/h',
          showInLegend: true,
          name: 'Bugatti Veyron',
          dataPoints: dataPoints1,
        },
        {
          type: 'stepLine',
          xValueFormatString: '#,##0 seconds',
          yValueFormatString: '#,##0 km/h',
          showInLegend: true,
          name: 'Lamborghini Aventador',
          dataPoints: dataPoints2,
        },
      ],
    };

    return (
      <div>
        <h1>En. Dist. Chart Test</h1>
        <CanvasJSChart
          options={options}
          onRef={(ref) => this.chart = ref}
        />
        {/* You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods */}
      </div>
    );
  }
}

export default DynamicMultiSeriesChart;
