/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';

const PowerMeter = ({
  label, color, level, maxlevel, barheight,
}) => (
  <>
    <Col>
      <h2>{label}</h2>
      <div className="meter-container">
        <div
          className={`${(level >= maxlevel) ? 'full' : ''}`}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            border: '1px solid gray',
            height: `${barheight}px`,
            transform: 'rotate(180deg)',
          }}
        >
          <div
            className="tween-height"
            style={{
              backgroundColor: color,
              height: PowerMeter.calcBarHeight(level, maxlevel, barheight),
            }}
          />
        </div>
        <h3>
          {Math.round(level)}
          /
          {maxlevel}
        </h3>
      </div>
    </Col>
  </>
);

PowerMeter.calcBarHeight = (level, maxlevel, barheight) => {
  let fillPercentage = level / maxlevel;
  if (fillPercentage > 1) fillPercentage = 1;
  return `${Math.ceil(fillPercentage * barheight)}px`;
};

PowerMeter.defaultProps = {
  label: 'Power',
  color: 'gray',
  level: 0.0,
  maxlevel: 100,
  barheight: 500,
};

PowerMeter.propTypes = {
  label: PropTypes.string,
  color: PropTypes.string,
  level: PropTypes.number,
  maxlevel: PropTypes.number,
  barheight: PropTypes.number,
};

export default PowerMeter;
