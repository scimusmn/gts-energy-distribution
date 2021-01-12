/* eslint no-console: 0 */
/* eslint react/prop-types: 0 */
/* eslint no-return-assign: 0 */
/* eslint import/no-named-as-default: 0 */
/* eslint import/no-named-as-default-member: 0 */
/* eslint react/no-array-index-key: 0 */

import React, { Component } from 'react';
import DynamicChart from '../components/DynamicChart';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';
import CanvasJSReact from '../lib/canvasjs/canvasjs.react';
import WeatherDataJSON from "../data/weather-data.json"
const { CanvasJSChart } = CanvasJSReact;

const dataPoints1 = [];
const dataPoints2 = [];
const updateInterval = 20;
// initial values
let yValue1 = 408;
let yValue2 = 350;
let xValue = 5;
let arduinoMsgRate = 0;
let lastArduinoValue = 0;

let dataTimestamps = [1,1,1,1];
let avgTimeBetweenMsgs = 0;
let prevTime = 0;

class CanvasJS extends Component {
  constructor() {
    super();
    this.updateChart = this.updateChart.bind(this);
    this.updateChartArduinoStyle = this.updateChartArduinoStyle.bind(this);
    this.onData = this.onData.bind(this);
  }

  onData(data) {
    console.log('chart -> onData:', data);

    // const message = Object.keys(data)[0];
    lastArduinoValue = Object.values(data)[0];

    const time = Date.now();
    const timeSinceLastMsgInMs = time - prevTime;
    dataTimestamps.push(timeSinceLastMsgInMs);
    if (dataTimestamps.length > 50) dataTimestamps.shift();
    prevTime = time;

    // this.updateChartArduinoStyle(value);
  }

  componentDidMount() {
    const { setOnDataCallback } = this.props;
    setOnDataCallback(this.onData);
    this.updateChart(1);
    setInterval(this.updateChartArduinoStyle, updateInterval);
  }

  arrayAverage (array) { 
    return array.reduce((a, b) => a + b) / array.length;
  }

  updateChartArduinoStyle() {
    console.log('updateChartArduinoStyle', lastArduinoValue);

      if (dataPoints1.length > 1000) dataPoints1.shift();

    xValue += 1;
    dataPoints1.push({
        x: xValue, // time
        y: parseInt(lastArduinoValue),
      });

    avgTimeBetweenMsgs = this.arrayAverage(dataTimestamps);

    this.chart.options.data[0].legendText = ` Arduino input rate - ${Math.round(1000/avgTimeBetweenMsgs)} messages per second, or ${Number.parseFloat(updateInterval/avgTimeBetweenMsgs).toFixed(2)} per chart update.`;
    // this.chart.options.data[1].legendText = ` Chart update rate - ${updateInterval} ms`;
    this.chart.render();
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
      if (dataPoints1.length > 76) dataPoints1.shift();
      if (dataPoints2.length > 76) dataPoints2.shift();
    }

    this.chart.options.data[0].legendText = ` Arduino input rate - ${avgTimeBetweenMsgs} messages per second`;
    // this.chart.options.data[1].legendText = ` Chart update rate - ${updateInterval} ms`;
    this.chart.render();
  }

  render() {
    const options = {
      zoomEnabled: true,
      theme: 'light2',
      title: {
        text: 'Real-time Arduino Charting Test',
      },
      axisX: {
        title: 'Chart updates every '+updateInterval+' milliseconds',
      },
      axisY: {
        suffix: ' km/h',
        includeZero: false,
        minimum: 0,
        maximum: 100,
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
          type: 'line',
          xValueFormatString: '#,##0 seconds',
          yValueFormatString: '#,##0 km/h',
          showInLegend: true,
          name: 'arduino hydro',
          dataPoints: dataPoints1,
        },
        // {
        //   type: 'stepLine',
        //   xValueFormatString: '#,##0 seconds',
        //   yValueFormatString: '#,##0 km/h',
        //   showInLegend: true,
        //   name: 'Lamborghini Aventador',
        //   dataPoints: dataPoints2,
        // },
      ],
    };

    return (
      <div>
        <CanvasJSChart
          options={options}
          onRef={(ref) => this.chart = ref}
        />
        {/* You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods */}
      </div>
    );
  }
}

const CanvasJSWithSerialCommunication = withSerialCommunication(CanvasJS);

export default CanvasJSWithSerialCommunication;
