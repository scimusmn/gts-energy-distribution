/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';

const MeterDiff = ({
  level1, level2, maxlevel, barheight, efficiency,
}) => (
  <>
    <div
      className={`meter-diff ${MeterDiff.calcColor(efficiency)}`}
      style={{
        height: `${barheight}px`,
        transform: 'rotate(180deg)',
        borderColor: `${MeterDiff.calcColor(efficiency)}`,
      }}
    >
      <div
        className={`tween-height bar ${level1 > level2 ? '' : 'flip'}`}
        style={{
          height: MeterDiff.calcDiffHeight(level1, level2, maxlevel, barheight),
          top: MeterDiff.calcYOffset(level1, level2, maxlevel, barheight),
        }}
      >
        <div
          className="inner"
        />
      </div>
    </div>
  </>
);

MeterDiff.calcColor = (efficiency) => {
  if (efficiency < 0.33) return 'warning';
  if (efficiency < 0.66) return 'neutral';
  return 'happy';
};

MeterDiff.calcYOffset = (level1, level2, maxlevel, barheight) => `${Math.ceil(MeterDiff.calcOffsetScale(level1, level2, maxlevel, barheight) * barheight)}px`;

MeterDiff.calcOffsetScale = (level1, level2, maxlevel) => {
  const higherLevel = Math.min(level1, level2);
  let fillPercentage = higherLevel / maxlevel;
  if (fillPercentage > 1) fillPercentage = 1;
  return fillPercentage;
};

MeterDiff.calcDiffHeight = (level1, level2, maxlevel, barheight) => {
  const diff = Math.abs(level1 - level2);
  let fillPercentage = diff / maxlevel;
  if (fillPercentage > 1) fillPercentage = 1;
  // Ensure diff bar can't exceed entire size of bar (when overproducing)
  const offsetScale = MeterDiff.calcOffsetScale(level1, level2, maxlevel, barheight);
  if (offsetScale + fillPercentage > 1) fillPercentage = 1 - offsetScale;
  return `${Math.ceil(fillPercentage * barheight)}px`;
};

MeterDiff.defaultProps = {
  level1: 0.0,
  level2: 0.0,
  maxlevel: 100,
  barheight: 500,
  efficiency: 0.0,
};

MeterDiff.propTypes = {
  level1: PropTypes.number,
  level2: PropTypes.number,
  maxlevel: PropTypes.number,
  barheight: PropTypes.number,
  efficiency: PropTypes.number,
};

export default MeterDiff;
