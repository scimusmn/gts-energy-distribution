/* eslint no-console: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Switch from 'react-switch';

class Toggle extends Component {
  constructor() {
    super();
    this.state = { checked: false };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(checked) {
    const { msg, onChange } = this.props;
    this.setState({ checked });

    // Convert bool to 1/0
    const intBool = checked ? 1 : 0;

    // Create data object that mimics what comes
    // from SerialHOC
    const dataObj = { [msg]: intBool };
    onChange(dataObj);
  }

  render() {
    const { checked } = this.state;
    return (
      <>
        <Switch onChange={this.handleChange} checked={checked} />
      </>
    );
  }
}

Toggle.propTypes = {
  msg: PropTypes.string.isRequired,
  onChange: PropTypes.instanceOf(Function).isRequired,
};

export default Toggle;
