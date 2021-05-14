/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const ReadyScreen = ({ currentView }) => (
  <Modal isOpen size="xl ready">
    <ModalHeader><h1>POWER THE CITY!</h1></ModalHeader>
    <ModalBody>
      {{
        ready1: <div>reaady yo 1</div>,
        ready2: <h1>POWER THE CITY2222</h1>,
        ready3: <div>reaady yo yo 3 y</div>,
      }[currentView]}
    </ModalBody>
    <ModalFooter>
      <h1>
        Ready to play? PRESS
        {' '}
        <strong>START.</strong>
      </h1>
    </ModalFooter>
  </Modal>
);

ReadyScreen.propTypes = {
  currentView: PropTypes.string.isRequired,
};

export default ReadyScreen;
