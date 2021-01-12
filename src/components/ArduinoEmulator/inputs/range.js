/* eslint no-console: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-input-slider';

class Range extends Component {
  constructor() {
    super();
    this.state = {
      sliderValue: 1,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    this.setState({ sliderValue: value.y });
    const { msg, onChange } = this.props;
    const dataObj = { [msg]: value.y };
    console.log('xxxxx range handleChange xxxxx');
    console.log(onChange);
    onChange(dataObj);
  }

  render() {
    const { sliderValue } = this.state;
    const { min, max } = this.props;

    return (
      <div>
        <div>{`${sliderValue}`}</div>
        <Slider
          axis="y"
          ystep={1.0}
          ymin={min}
          ymax={max}
          y={sliderValue}
          yreverse
          onChange={this.handleChange}
          styles={{
            thumb: {
              width: 85,
              height: 33,
            },
          }}
        />
      </div>
    );
  }
}

Range.defaultProps = {
  min: 0.0,
  max: 100.0,
};

Range.propTypes = {
  msg: PropTypes.string.isRequired,
  onChange: PropTypes.instanceOf(Function).isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
};

export default Range;
