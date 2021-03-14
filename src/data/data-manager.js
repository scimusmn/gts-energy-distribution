/* eslint no-console: 0 */

import {
  FishArray, FishObject, CollateByProperty, SumArray,
} from '../utils';

import EnvironmentalJSON from './environmental-data.json';
import MessageCenterJSON from './message-center.json';

// We organize forecasts into 3-Day "sets" using the "Set" field.
const FORECASTS = CollateByProperty(EnvironmentalJSON, 'Set');

// Clean up superflous rows by 'Set' (e.g. spacer rows)
delete FORECASTS[''];

// We can use this JSON array as-is
const SORTED_TRIGGER_MESSAGES = CollateByProperty(MessageCenterJSON, 'Trigger');

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

// Use a polarized efficiency to trigger message
// center messages. Over-producing comes in as a
// negative polarity. Under-producing is positive.
let prevTriggerType = '';
let triggerCounter = 0;
let blackoutWarnings = 0;
const checkMessageCenterTriggers = (efficiency, polarity) => {
  console.log('checkMessageCenterTriggers', efficiency, polarity);

  let triggerType;

  // BLACKOUT_WARNING
  if (polarity === 1 && efficiency < 0.33) triggerType = 'BLACKOUT_WARNING';
  // OVER_PRODUCTION
  if (polarity === -1 && efficiency < 0.33) triggerType = 'OVER_PRODUCTION';
  // AFFIRMATION
  if (efficiency > 0.66) triggerType = 'AFFIRMATION';

  console.log(triggerType, triggerCounter);

  if (triggerType === prevTriggerType) {
    triggerCounter += 1;
  } else {
    triggerCounter = 0;
  }
  // Trigger a real blackout if X warnings have
  // been displayed
  if (triggerType === 'BLACKOUT_WARNING' && triggerCounter > 8) {
    triggerCounter = 0;
    return FishArray(SORTED_TRIGGER_MESSAGES.FEEDBACK_BLACKOUT);
  }
  if (triggerType !== prevTriggerType || triggerCounter > 5) {
    triggerCounter = 0;
    prevTriggerType = triggerType;
    if (triggerType === 'BLACKOUT_WARNING') {
      blackoutWarnings += 1;
      if (blackoutWarnings > 3) {
        blackoutWarnings = 0;
        return FishArray(SORTED_TRIGGER_MESSAGES.FEEDBACK_BLACKOUT);
      }
    } else {
      blackoutWarnings = 0;
    }
    if (triggerType) return FishArray(SORTED_TRIGGER_MESSAGES[triggerType]);
  }

  return null;
};

const getSessionFeedback = (sessionData) => {
  console.log('getSessionFeedback');
  const { feedback, energy } = sessionData;

  // We can use this JSON array as-is.
  const triggers = CollateByProperty(feedback, 'Trigger');

  // If session ended in blackout, return blackout.
  if (triggers.FEEDBACK_BLACKOUT) return triggers.FEEDBACK_BLACKOUT[0];

  const {
    coal, gas, hydro, solar, wind,
  } = energy;

  let renewables = SumArray(solar) + SumArray(wind) + SumArray(hydro);
  let fossils = SumArray(coal) + SumArray(gas);
  const total = renewables + fossils;

  // Convert to fractions
  renewables /= total;
  fossils /= total;

  // Player over-reliant on fossil fuels
  if (fossils > 0.75) return FishArray(SORTED_TRIGGER_MESSAGES.FEEDBACK_DIVERSIFY_FOSSILS);

  // Player over-reliant on renewables
  if (renewables > 0.75) return FishArray(SORTED_TRIGGER_MESSAGES.FEEDBACK_DIVERSIFY_RENEWABLES);

  // Give a generic "good job"
  return FishArray(SORTED_TRIGGER_MESSAGES.FEEDBACK_SUCCESS);
};

const getRandomForecast = () => FishObject(FORECASTS);

const getFeedbackMessage = (triggerId) => FishArray(SORTED_TRIGGER_MESSAGES[triggerId]).Body;

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
  checkMessageCenterTriggers,
  getFeedbackMessage,
  getSessionFeedback,
  getDemand,
  getTime,
  getFieldAtHour,
  getCurrentForecastField,
  getSolarAvailability,
  getWindAvailability,
};

export default DataManager;
