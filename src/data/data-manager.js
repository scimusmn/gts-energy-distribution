/* eslint no-console: 0 */

import {
  FishArray, FishObject, CollateByProperty,
} from '../utils';

import EnvironmentalJSON from './environmental-data.json';
import MessageCenterJSON from './message-center.json';

// We organize forecasts into 3-Day "sets" using the "Set" field.
const FORECASTS = CollateByProperty(EnvironmentalJSON, 'Set');

// Clean up superflous rows by 'Set' (e.g. spacer rows)
delete FORECASTS[''];

// We can use this JSON array as-is
const MESSAGE_CENTER_MESSAGES = MessageCenterJSON;

let currentSessionForecast;

const selectNewForecast = () => {
  currentSessionForecast = FishObject(FORECASTS);
  return currentSessionForecast;
};

// Use Noon slide to summarize day
const getForecastSummary = () => {
  const summaryDays = [];
  for (let i = 0; i < currentSessionForecast.length; i += 1) {
    if (currentSessionForecast[i].Time === '1:00 PM') {
      summaryDays.push(currentSessionForecast[i]);
    }
  }
  return summaryDays;
};

// Convert Condition string to a solar availability score
const conditionToSolarPotential = (condition) => {
  let potential = 1.0;
  switch (condition) {
    case 'Fair':
      potential = 1.0;
      break;
    case 'Partly Cloudy':
      potential = 0.8;
      break;
    case 'Mostly Cloudy':
      potential = 0.7;
      break;
    case 'Cloudy':
      potential = 0.6;
      break;
    case 'Cloudy / Windy':
      potential = 0.5;
      break;
    case 'Light Snow':
      potential = 0.4;
      break;
    default:
      console.log('Warning! Condition unaccounted for:', condition);
      potential = 1.0;
      break;
  }
  return potential;
};

const getRandomForecast = () => FishObject(FORECASTS);

const getRandomMessageCenter = () => FishArray(MESSAGE_CENTER_MESSAGES);

const getDemand = (hourIndex) => parseFloat(currentSessionForecast[hourIndex].Demand);

const getTime = (hourIndex) => currentSessionForecast[hourIndex].Time;

const getFieldAtHour = (hourIndex, field) => currentSessionForecast[hourIndex][field];

const getSolarAvailability = (hourIndex) => conditionToSolarPotential(getFieldAtHour(hourIndex, 'Condition'));

const getCurrentForecastField = (field) => currentSessionForecast.map((a) => a[field]);

const DataManager = {
  selectNewForecast,
  getForecastSummary,
  getRandomForecast,
  getRandomMessageCenter,
  getDemand,
  getTime,
  getFieldAtHour,
  getCurrentForecastField,
  getSolarAvailability,
};

export default DataManager;
