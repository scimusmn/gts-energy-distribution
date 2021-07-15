import React from 'react';
import PropTypes from 'prop-types';
import Sky from './Sky';
import Sun from './Sun';
import Clouds from './Clouds';
import Cityscape from './Cityscape';

const DayCycle = ({
  duration,
  animOffset,
  wind,
  solarAvailability,
  energyData,
  paused,
  night,
}) => {
  let gasProd = 0;
  let coalProd = 0;
  let hydroProd = 0;
  if (energyData.hydro) {
    hydroProd = energyData.hydro[energyData.hydro.length - 1];
    coalProd = energyData.coal[energyData.coal.length - 1];
    gasProd = energyData.gas[energyData.gas.length - 1];
  }

  return (
    <div className={paused ? 'day-cycle paused' : 'day-cycle'}>
      <Sky duration={duration} animOffset={animOffset} paused={paused} />
      <Sun duration={duration} animOffset={animOffset} paused={paused} />
      <Clouds wind={wind} quantity={7} />
      <Cityscape
        wind={wind >= 8}
        solar={solarAvailability >= 0.1}
        gas={gasProd > 0}
        coal={coalProd > 0}
        hydro={hydroProd > 0}
        night={night}
      />
    </div>
  );
};

DayCycle.propTypes = {
  duration: PropTypes.number.isRequired,
  animOffset: PropTypes.number.isRequired,
  wind: PropTypes.number.isRequired,
  solarAvailability: PropTypes.number.isRequired,
  energyData: PropTypes.objectOf(PropTypes.array).isRequired,
  paused: PropTypes.bool.isRequired,
  night: PropTypes.bool.isRequired,
};

export default DayCycle;
