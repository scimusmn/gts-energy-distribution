const Settings = {
  // Total session duration in milliseconds
  SESSION_DURATION: 110 * 1000,

  // Days contained within a session
  // (3 days max with current data)
  DAYS_PER_SESSION: 3,

  // Amplifies efficiency difficulty
  // (higher = more difficult)
  EFFICIENCY_SCORE_MULTIPLIER: 1.5,

  SCORE_PERFORMANCE_GOOD: 90, // Not currently being used
  SCORE_PERFORMANCE_MEDIUM: 75, // Not currently being used
  SCORE_PERFORMANCE_POOR: 50, // Not currently being used

  // Repetitions required to trigger
  // feedback of same type.
  MIN_CUSTOMER_FEEDBACK_INTERVAL: 3,

  // Production output of each
  // panel when at full capacity/power
  MAX_OUTPUT_PER_PANEL: 50,

  // Displayed max production on
  // power-meters and production chart
  MAX_EXPECTED_DEMAND: 250,

  // Efficiency above this percentage
  // will trigger positive feedback
  // (higher = harder to trigger)
  AFFIRMATION_THRESHOLD: 0.66,

  // Efficiency below this percentage, while
  // over-producing, will trigger appropriate feedback
  // (lower = harder to trigger)
  OVER_PRODUCTION_THRESHOLD: 0.33,

  // Efficiency below this percentage, while under-producing,
  // will trigger a blackout warning
  // (lower = harder to trigger)
  BLACKOUT_THRESHOLD: 0.33,

  // How many blackout warnings to display
  // before "real" blackout (higher = less difficult)
  WARNINGS_BEFORE_BLACKOUT: 3,

  // The amount incremented/decremented
  // with each arrow button press.
  GAS_ARROW_POWER: 5.0,

  // Number of sim-hours that need to
  // pass before triggering 'on' state.
  COAL_WARMING_DELAY: 6,
};

export default Settings;
