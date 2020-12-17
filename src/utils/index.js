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

// Sort a larger array of objects into multiple
// smaller arrays by a matching property
export const CollateByProperty = (array, property) => array.reduce((acc, cur) => {
  acc[cur[property]] = [...acc[cur[property]] || [], cur];
  return acc;
}, {});

export default {
  NewKey,
  FishArray,
  FishMany,
  FishObject,
  CollateByProperty,
};
