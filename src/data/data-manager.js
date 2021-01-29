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
const SORTED_MOOD_MESSAGES = CollateByProperty(MessageCenterJSON, 'Mood');

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
      potential = 0.75;
      break;
    case 'Mostly Cloudy':
      potential = 0.5;
      break;
    case 'Cloudy':
      potential = 0.3;
      break;
    case 'Cloudy / Windy':
      potential = 0.3;
      break;
    case 'Light Snow':
      potential = 0.2;
      break;
    default:
      console.log('Warning! Condition unaccounted for:', condition);
      potential = 1.0;
      break;
  }
  return potential;
};

// Convert time of day to a solar availability score
const timeOfDayToSolarPotential = (time) => {
  let potential = 1.0;
  // TODO: For performance boost, all times
  // could be converted to floats (0–24).
  switch (time) {
    case '12:00 AM':
    case '1:00 AM':
    case '2:00 AM':
    case '3:00 AM':
    case '4:00 AM':
    case '5:00 AM':
    case '6:00 AM':
    case '7:00 AM':
    case '8:00 AM':
      potential = 0.0;
      break;
    case '9:00 AM':
      potential = 0.35;
      break;
    case '10:00 AM':
      potential = 0.7;
      break;
    case '11:00 AM':
      potential = 1.0;
      break;
    case '12:00 PM':
      potential = 1.0;
      break;
    case '1:00 PM':
      potential = 1.0;
      break;
    case '2:00 PM':
      potential = 1.0;
      break;
    case '3:00 PM':
      potential = 0.85;
      break;
    case '4:00 PM':
      potential = 0.65;
      break;
    case '5:00 PM':
      potential = 0.4;
      break;
    case '6:00 PM':
    case '7:00 PM':
    case '8:00 PM':
    case '9:00 PM':
    case '10:00 PM':
    case '11:00 PM':
      potential = 0.0;
      break;
    default:
      console.log('Warning! Time of day unaccounted for:', time);
      potential = 1.0;
      break;
  }
  return potential;
};

// Convert Condition string to a solar availability score
const windSpeedToWindPotential = (windSpeed) => {
  // Extract number from string ('23 mph' -> 23)
  const speed = parseFloat(windSpeed.split(' ')[0]);
  let potential = 1.0;
  // TODO: replace windspeed max and min with Settings.values
  if (speed < 8) {
    potential = 0.0;
  } else if (speed > 28) {
    potential = 1.0;
  } else {
    // TODO: map 8–28 range to 0–1 range
    potential = 0.75; // temp
  }
  return potential;
};

// Use Noon slide to summarize day
const checkMessageCenterTriggers = (efficiency) => {
  // TODO: This will need to get more complex at some point
  // E.g. we should take into account how long it's been
  // since the last msg center msg

  if (efficiency > 50) {
    return FishArray(SORTED_MOOD_MESSAGES.angry);
  } if (efficiency < -50) {
    return FishArray(SORTED_MOOD_MESSAGES.angry);
  }
  // If nothing is triggered, occasionally
  // display a positive or neutral message
  if (Math.random() > 0.8) {
    return FishArray(SORTED_MOOD_MESSAGES.happy);
  }

  return null;
};

const getRandomForecast = () => FishObject(FORECASTS);

const getRandomMessageCenter = () => FishArray(MESSAGE_CENTER_MESSAGES);

const getDemand = (hourIndex) => parseFloat(currentSessionForecast[hourIndex].Demand);

const getTime = (hourIndex) => currentSessionForecast[hourIndex].Time;

const getFieldAtHour = (hourIndex, field) => currentSessionForecast[hourIndex][field];

const getSolarAvailability = (hourIndex) => {
  const conditionPotential = conditionToSolarPotential(getFieldAtHour(hourIndex, 'Condition'));
  const timeOfDayPotential = timeOfDayToSolarPotential(getFieldAtHour(hourIndex, 'Time'));
  return conditionPotential * timeOfDayPotential;
};

const getWindAvailability = (hourIndex) => windSpeedToWindPotential(getFieldAtHour(hourIndex, 'WindSpeed'));

const getCurrentForecastField = (field) => currentSessionForecast.map((a) => a[field]);

const DataManager = {
  selectNewForecast,
  getForecastSummary,
  getRandomForecast,
  getRandomMessageCenter,
  checkMessageCenterTriggers,
  getDemand,
  getTime,
  getFieldAtHour,
  getCurrentForecastField,
  getSolarAvailability,
  getWindAvailability,
};

export default DataManager;
