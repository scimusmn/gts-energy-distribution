/* eslint no-console: 0 */
/* eslint react/prop-types: 0 */
/* eslint no-return-assign: 0 */
/* eslint import/no-named-as-default: 0 */
/* eslint import/no-named-as-default-member: 0 */
/* eslint react/no-array-index-key: 0 */

import React, { Component } from 'react';
import withSerialCommunication from '../Arduino/arduino-base/ReactSerial/SerialHOC';
import ChartJSReact from '../components/ChartJSWrapper/ChartJSWrapper';
const { ChartJSChart } = ChartJSReact;
import WeatherDataJSON from "../data/weather-data.json"

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

let prevTime = 0;

class ChartJS extends Component {
  constructor() {
    super();
    this.updateChartArduinoStyle = this.updateChartArduinoStyle.bind(this);
    this.onData = this.onData.bind(this);

    this.maxDataPoints = 1000;
    this.avgTimeBetweenMsgs = 0;

    this.statsRef = React.createRef();

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
    

    // Fill chart with dummy data
    for (let i = 0; i < this.maxDataPoints; i++) {
      dataPoints1.push({
        t: xValue, // time
        y: 0,
      });
      xValue += 1;
      
    }

    setInterval(this.updateChartArduinoStyle, updateInterval);
  }

  arrayAverage (array) { 
    return array.reduce((a, b) => a + b) / array.length;
  }

  updateChartArduinoStyle() {
    console.log('updateChartArduinoStyle', lastArduinoValue);

      if (dataPoints1.length > this.maxDataPoints) dataPoints1.shift();

    xValue += 1;
    // dataPoints1.push({
    //     x: xValue, // time
    //     y: parseInt(lastArduinoValue),
    //   });

      dataPoints1.push({
        t: xValue, // time
        y: parseInt(lastArduinoValue),
      });

    this.avgTimeBetweenMsgs = this.arrayAverage(dataTimestamps);
    
    this.statsRef.current.innerHTML = `Arduino input rate: ${Math.round(1000/this.avgTimeBetweenMsgs)} messages per second, or ${Number.parseFloat(updateInterval/this.avgTimeBetweenMsgs).toFixed(2)} per chart update.`;

    // this.chart.options.data[0].legendText = ` Arduino input rate - ${Math.round(1000/avgTimeBetweenMsgs)} messages per second, or ${Number.parseFloat(updateInterval/avgTimeBetweenMsgs).toFixed(2)} per chart update.`;
    // this.chart.options.data[1].legendText = ` Chart update rate - ${updateInterval} ms`;

    // this.chart.data.datasets.forEach((dataset) => {
    //   console.log('charting');
    //   // console.log(dataset.data);
    //   dataset.data[15].y = parseInt(lastArduinoValue);
    // });

    this.chart.data.datasets[0].data = dataPoints1;
    this.chart.update('none');
    
  }

  render() {
    return (
      <div >
        <h1>Real-time Performance Test (ChartJS)</h1>
        <p ref={this.statsRef} >incoming data</p>
        <ChartJSChart
          // options={options}
          onRef={(ref) => this.chart = ref}
        />
        {/* You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods */}
      </div>
    );
  }
}

const ChartJSWithSerialCommunication = withSerialCommunication(ChartJS);

export default ChartJSWithSerialCommunication;
