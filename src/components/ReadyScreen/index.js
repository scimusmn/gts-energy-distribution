/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import PropTypes from 'prop-types';
import Forecast from '../Forecast';

const ReadyScreen = ({ forecast }) => (
  <Modal isOpen size="xl">
    <ModalHeader><h1>Ready?</h1></ModalHeader>
    <ModalBody>
      <Forecast days={forecast} />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <h3>Select your power sources by plugging in their jacks.</h3>
      <br />
    </ModalBody>
    <ModalFooter>
      <h1>
        Press
        {' '}
        <strong>Start</strong>
        {' '}
        button to begin!
      </h1>
    </ModalFooter>
  </Modal>
);

ReadyScreen.defaultProps = {
  forecast: [],
};

ReadyScreen.propTypes = {
  forecast: PropTypes.instanceOf(Array),
};

export default ReadyScreen;
