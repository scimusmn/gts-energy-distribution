// Provide unique key safe for React array mapping
let UniqueKeyCounter = 0;
export const NewKey = () => {
  UniqueKeyCounter += 1;
  return UniqueKeyCounter;
};

// Return random item from array
export const FishArray = (array) => {
  const rIndex = Math.floor(Math.random() * array.length);
  return array[rIndex];
};

// Return multiple random items from array
export const FishMany = (array, num) => {
  const items = [];
  for (let i = 0; i < num; i += 1) {
    items.push(FishArray(array));
  }
  return items;
};

// Return random key/value from Object
export const FishObject = (obj) => {
  const keys = Object.keys(obj);
  const rKey = keys[Math.floor(keys.length * Math.random())];
  return obj[rKey];
};

// Average an array of numbers
export const AverageArray = (array) => array.reduce((a, b) => a + b) / array.length;

// Sum an array of numbers
export const SumArray = (array) => array.reduce((a, b) => a + b, 0);

// Map a value from one range onto anothe range
export const Map = (val, x1, x2, y1, y2) => ((val - x1) * (y2 - y1)) / (x2 - x1) + y1;

// Clamp a value to a range
export const Clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Sort a larger array of objects into multiple
// smaller arrays by matching a property
export const CollateByProperty = (array, property) => array.reduce((acc, cur) => {
  acc[cur[property]] = [...acc[cur[property]] || [], cur];
  return acc;
}, {});

// Finds and return first number found in string
export const ExtractFloat = (string) => parseFloat(string.match(/\d+/)[0]);

const formatAMPMString = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  hours = hours || 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  const strTime = `${hours}:${minutes} ${ampm}`;
  return strTime;
};

export const NearestTimeInterval = (secs, intervalMins) => {
  intervalMins = intervalMins || 1; // eslint-disable-line no-param-reassign

  const timeToReturn = new Date(1970, 0, 1); // Epoch
  timeToReturn.setSeconds(secs);

  timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
  timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
  timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / intervalMins) * intervalMins);

  return formatAMPMString(timeToReturn);
};

export default {
  NewKey,
  FishArray,
  FishMany,
  FishObject,
  AverageArray,
  SumArray,
  CollateByProperty,
  ExtractFloat,
  NearestTimeInterval,
};
