/* eslint no-console: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

class EventButton extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { msg, onChange } = this.props;

    // Create data object that mimics what comes
    // from SerialHOC
    const dataObj = { [msg]: 1 };
    onChange(dataObj);
  }

  render() {
    const { label } = this.props;
    return (
      <>
        <Button color="primary" size="lg" onClick={() => this.handleClick()}>{label}</Button>
      </>
    );
  }
}

EventButton.propTypes = {
  msg: PropTypes.string.isRequired,
  onChange: PropTypes.instanceOf(Function).isRequired,
  label: PropTypes.string.isRequired,
};

export default EventButton;
