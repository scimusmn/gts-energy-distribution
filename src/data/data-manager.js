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

const getRandomForecast = () => FishObject(FORECASTS);

const getRandomMessageCenter = () => FishArray(MESSAGE_CENTER_MESSAGES);

const getDemand = (hourIndex) => parseFloat(currentSessionForecast[hourIndex].Demand);

const getTime = (hourIndex) => currentSessionForecast[hourIndex].Time;

const DataManager = {
  selectNewForecast,
  getRandomForecast,
  getRandomMessageCenter,
  getDemand,
  getTime,
};

export default DataManager;
