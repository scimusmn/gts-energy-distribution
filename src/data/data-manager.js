import { FishArray, FishMany } from '../utils';

const FORECASTS = [
  {
    day: 'Monday', description: 'Windy', temperature: '72', icon: 'cloudy',
  },
  {
    day: 'Tuesday', description: 'Rough', temperature: '66', icon: 'cloudy',
  },
  {
    day: 'Wednesday', description: 'Hold on!', temperature: '55', icon: 'chanceflurries',
  },
  {
    day: 'Thursday', description: 'Gassy', temperature: '60', icon: 'clear',
  },
  {
    day: 'Friday', description: 'Sweet', temperature: '84', icon: 'partlycloudy',
  },
  {
    day: 'Saturday', description: ' ', temperature: '97', icon: 'flurries',
  },
  {
    day: 'Dingday', description: 'Decent', temperature: '46', icon: 'clear',
  },
  {
    day: 'Trunday', description: 'Whoah!', temperature: '24', icon: 'rain',
  },
];

const MESSAGE_CENTER_MESSAGES = [
  {
    mood: 'angry', trigger: 'blackout', body: 'Hey, you are screwing up!',
  },
  {
    mood: 'happy', trigger: 'random', body: 'You are doing great.',
  },
  {
    mood: 'angry', trigger: 'blackout', body: 'What the heck is going on over there?! FIX IT.',
  },
  {
    mood: 'happy', trigger: 'success', body: 'Wow, you are swell. Everyone has power. Thanks.',
  },
];


const getRandomForecast = (numDays) => FishMany(FORECASTS, numDays);

const getRandomMessageCenter = () => FishArray(MESSAGE_CENTER_MESSAGES);

const DataManager = {
  getRandomForecast,
  getRandomMessageCenter,
};

export default DataManager;
