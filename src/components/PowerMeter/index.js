/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';

const PowerMeter = ({
  label, color, level, barheight,
}) => (
  <>
    <Col>
      <h2>{label}</h2>
      <div className="meter-container">
        <h3>{level}</h3>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          border: '1px solid gray',
          height: `${barheight}px`,
          transform: 'rotate(180deg)',
        }}
        >
          <div className="tween-height" style={{ backgroundColor: color, height: `${Math.round((level / 100) * barheight)}px` }} />
        </div>
      </div>
    </Col>
  </>
);

PowerMeter.defaultProps = {
  label: 'Power',
  color: 'gray',
  level: 0.0,
  barheight: 500,
};

PowerMeter.propTypes = {
  label: PropTypes.string,
  color: PropTypes.string,
  level: PropTypes.number,
  barheight: PropTypes.number,
};

export default PowerMeter;
