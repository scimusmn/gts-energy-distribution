/* eslint no-console: 0 */
import {
  FishArray,
  FishObject,
  CollateByProperty,
  SumArray,
  Map,
  ExtractFloat,
} from '../utils';

import Settings from './settings';

import EnvironmentalJSON from './environmental-data.json';
import MessageCenterJSON from './message-center.json';

// Creative numerical Time values from Time strings
EnvironmentalJSON.forEach((row) => {
  const [hrMin, amPm] = row.Time.split(' ');
  let [hours, minutes] = hrMin.split(':'); // eslint-disable-line prefer-const
  if (hours === '12') hours = '0'; // eslint-disable-line no-param-reassign
  let timeNum = parseFloat((minutes * 60)) + parseFloat((hours * 3600));
  if (amPm === 'PM') timeNum += (12 * 3600);
  row.TimeNum = timeNum; // eslint-disable-line no-param-reassign
});

// Create numerical Temperature values
EnvironmentalJSON.forEach((row) => {
  row.TemperatureNum = ExtractFloat(row.Temperature); // eslint-disable-line no-param-reassign
});

// Create numericaal WindSpeed values
EnvironmentalJSON.forEach((row) => {
  row.WindSpeedNum = ExtractFloat(row.WindSpeed); // eslint-disable-line no-param-reassign
});

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
    // Snap to 75% potential
    // when not min or max wind
    potential = 0.75;
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
  let triggerType;

  // BLACKOUT_WARNING
  if (polarity === 1 && efficiency < Settings.BLACKOUT_THRESHOLD) triggerType = 'BLACKOUT_WARNING';
  // OVER_PRODUCTION
  if (polarity === -1 && efficiency < Settings.OVER_PRODUCTION_THRESHOLD) triggerType = 'OVER_PRODUCTION';
  // AFFIRMATION
  if (efficiency > Settings.AFFIRMATION_THRESHOLD) triggerType = 'AFFIRMATION';

  if (triggerType === prevTriggerType) {
    triggerCounter += 1;
  } else {
    triggerCounter = 0;
  }

  if (triggerType !== prevTriggerType || triggerCounter > 5) {
    triggerCounter = 0;
    prevTriggerType = triggerType;
    if (triggerType === 'BLACKOUT_WARNING') {
      blackoutWarnings += 1;
      // Trigger "real" blackout afer X warnings
      if (blackoutWarnings > Settings.WARNINGS_BEFORE_BLACKOUT) {
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

const interpolate = (hourIndex, hourProgress, field) => {
  const nextVal = parseFloat(getFieldAtHour(hourIndex, field));
  const prevVal = parseFloat(getFieldAtHour(hourIndex - 1, field));
  const interpolatedVal = Map(hourProgress, 0, 1, prevVal, nextVal);
  return interpolatedVal;
};

// This time interpolation is slightly different in that it
// helps wrap around from PM to AM without going "backwards"
const timeInterpolate = (hourIndex, hourProgress, field) => {
  let nextVal = parseFloat(getFieldAtHour(hourIndex, field));
  const prevVal = parseFloat(getFieldAtHour(hourIndex - 1, field));

  if (nextVal === 0) {
    nextVal = 86400;
  }
  const interpolatedVal = Map(hourProgress, 0, 1, prevVal, nextVal);
  return interpolatedVal;
};

const getSolarAvailability = (hourIndex, hourProgress) => {
  const nexConditionPotential = conditionToSolarPotential(getFieldAtHour(hourIndex, 'Condition'));
  const nextTimeOfDayPotential = timeOfDayToSolarPotential(getFieldAtHour(hourIndex, 'Time'));
  const nextAvailibility = nexConditionPotential * nextTimeOfDayPotential;

  if (hourIndex <= 0) return nextAvailibility;

  const prevConditionPotential = conditionToSolarPotential(getFieldAtHour(hourIndex - 1, 'Condition'));
  const prevTimeOfDayPotential = timeOfDayToSolarPotential(getFieldAtHour(hourIndex - 1, 'Time'));
  const prevAvailibility = prevConditionPotential * prevTimeOfDayPotential;

  const interpolatedVal = Map(hourProgress, 0, 1, prevAvailibility, nextAvailibility);

  return interpolatedVal;
};

const getWindAvailability = (hourIndex, hourProgress) => {
  const nextWindAvailibility = windSpeedToWindPotential(getFieldAtHour(hourIndex, 'WindSpeed'));

  if (hourIndex <= 0) return nextWindAvailibility;

  const prevWindAvailibility = windSpeedToWindPotential(getFieldAtHour(hourIndex - 1, 'WindSpeed'));

  const interpolatedVal = Map(hourProgress, 0, 1, prevWindAvailibility, nextWindAvailibility);
  return interpolatedVal;
};

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
  interpolate,
  timeInterpolate,
  getCurrentForecastField,
  getSolarAvailability,
  getWindAvailability,
};

export default DataManager;
