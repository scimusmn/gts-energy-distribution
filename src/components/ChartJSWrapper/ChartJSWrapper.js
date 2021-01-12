/* eslint-disable */
var React = require('react');
import ChartJS from 'chart.js';
var moment = require('moment');
// var myChart = new Chart(ctx, {...});

class ChartJSChart extends React.Component {
	static _cjsContainerId = 0;
	constructor(props) {		
		super(props);
		this.options = props.options ? props.options : {};		
		this.containerProps = props.containerProps ? props.containerProps : {width: "100%", position: "relative"};
		this.containerProps.height = props.containerProps && props.containerProps.height ? props.containerProps.height : this.options.height ? this.options.height + "px" : "400px";
		this.chartContainerId = "canvasjs-react-chart-container-" + ChartJSChart._cjsContainerId++;
	}	
	componentDidMount() {

		// Get canvas context of chart
		var ctx = document.getElementById('myChart');

		if(this.props.onRef)
			this.props.onRef(this.chart);

		function generateData() {
			var unit = 'millisecond';

			function unitLessThanDay() {
				return unit === 'second' || unit === 'minute' || unit === 'hour';
			}

			function beforeNineThirty(date) {
				return date.hour() < 9 || (date.hour() === 9 && date.minute() < 30);
			}

			// Returns true if outside 9:30am-4pm on a weekday
			function outsideMarketHours(date) {
				if (date.isoWeekday() > 5) {
					return true;
				}
				if (unitLessThanDay() && (beforeNineThirty(date) || date.hour() > 16)) {
					return true;
				}
				return false;
			}

			function randomNumber(min, max) {
				return Math.random() * (max - min) + min;
			}

			function randomBar(date, lastClose) {
				var open = randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);
				var close = randomNumber(open * 0.95, open * 1.05).toFixed(2);
				return {
					t: date.valueOf(),
					y: close
				};
			}

			var date = moment('Jan 01 1990', 'MMM DD YYYY');
			var now = moment();
			var data = [];
			var lessThanDay = unitLessThanDay();
			for (; data.length < 199 && date.isBefore(now); date = date.clone().add(1, unit).startOf(unit)) {
				if (outsideMarketHours(date)) {
					if (!lessThanDay || !beforeNineThirty(date)) {
						date = date.clone().add(date.isoWeekday() >= 5 ? 8 - date.isoWeekday() : 1, 'day');
					}
					if (lessThanDay) {
						date = date.hour(9).minute(30).second(0);
					}
				}
				data.push(randomBar(date, data.length > 0 ? data[data.length - 1].y : 30));
			}

			return data;
		}

		var chartConfig = {
			data: {
				datasets: [{
					label: 'Arduino Input Value',
					data: [],
					type: 'line',
					pointRadius: 0,
					borderColor: "red",
					pointBackgroundColor: "#113ae7",
   					pointBorderColor: "#11bae7",
					fill: false,
					lineTension: 0,
					borderWidth: 2
				}]
			},
			options: {
				animation: {
					duration: 0 // general animation time
				},
				hover: {
					animationDuration: 0 // duration of animations when hovering an item
				},
				elements: {
					line: {
						tension: 0 // disables bezier curves
					}
				},
				// showLines: false, // disable for all datasets
				responsiveAnimationDuration: 0, // animation duration after a resize
				scales: {
					xAxes: [{
						type: 'time',
						distribution: 'series',
						offset: true,
						ticks: {
							major: {
								enabled: true,
								fontStyle: 'bold'
							},
							source: 'data',
							autoSkip: true,
							autoSkipPadding: 75,
							// maxRotation: 0,
							sampleSize: 100
						},
						// afterBuildTicks: function(scale, ticks) {
						// 	var majorUnit = scale._majorUnit;
						// 	var firstTick = ticks[0];
						// 	var i, ilen, val, tick, currMajor, lastMajor;

						// 	val = moment(ticks[0].value);
						// 	if ((majorUnit === 'minute' && val.second() === 0)
						// 			|| (majorUnit === 'hour' && val.minute() === 0)
						// 			|| (majorUnit === 'day' && val.hour() === 9)
						// 			|| (majorUnit === 'month' && val.date() <= 3 && val.isoWeekday() === 1)
						// 			|| (majorUnit === 'year' && val.month() === 0)) {
						// 		firstTick.major = true;
						// 	} else {
						// 		firstTick.major = false;
						// 	}
						// 	lastMajor = val.get(majorUnit);

						// 	for (i = 1, ilen = ticks.length; i < ilen; i++) {
						// 		tick = ticks[i];
						// 		val = moment(tick.value);
						// 		currMajor = val.get(majorUnit);
						// 		tick.major = currMajor !== lastMajor;
						// 		lastMajor = currMajor;
						// 	}
						// 	return ticks;
						// }
					}],
					yAxes: [{
						gridLines: {
							drawBorder: false
						},
						scaleLabel: {
							display: true,
							labelString: 'Arduino analog input'
						},
						ticks: {
							beginAtZero: true,
							max : 100,
							min : 0,
					   }
					}]
				},
				tooltips: {
					intersect: false,
					mode: 'index',
					callbacks: {
						label: function(tooltipItem, myData) {
							var label = myData.datasets[tooltipItem.datasetIndex].label || '';
							if (label) {
								label += ': ';
							}
							label += parseFloat(tooltipItem.value).toFixed(2);
							return label;
						}
					}
				}
			}
		};

		this.chart = new Chart(ctx, chartConfig);

		// this.chart.render();
		
		if(this.props.onRef)
			this.props.onRef(this.chart);

		// setInterval(() => {
		// 	    this.chart.data.datasets.forEach((dataset) => {
		// 		    console.log('--> charting');
		// 		    console.log(dataset.data);
		// 		    dataset.data[15].y = (Math.random() * 100);
		// 		});

		//   this.chart.update('none');
		// }, 1111);
	}	
    shouldComponentUpdate(nextProps, nextState){
		//Check if Chart-options has changed and determine if component has to be updated
		return false;
        // return !(nextProps.options === this.options);
    }
	componentDidUpdate() {
		//Update Chart Options & Render
		// this.chart.options = this.props.options;
		// this.chart.render();
	}
	componentWillUnmount() {
		//Destroy chart and remove reference
		this.chart.destroy();
		if(this.props.onRef)
			this.props.onRef(undefined);
	}		
	render() {		
		//return React.createElement('div', { id: this.chartContainerId, style: this.containerProps });		
		// return <div id = {this.chartContainerId} style = {this.containerProps}/>	
		return <canvas id="myChart" width="800" height="400"></canvas>	
	}	
}

var ChartJSReact = {
    ChartJSChart: ChartJSChart,
    ChartJS: ChartJS
};

export default ChartJSReact;