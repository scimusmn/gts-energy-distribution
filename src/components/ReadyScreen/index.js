/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const ReadyScreen = () => (
  <Modal isOpen size="xl">
    <ModalHeader><h1>POWER THE CITY</h1></ModalHeader>
    <ModalBody>
      <br />
      <h2>Plug in your power lines. You can choose up to 10.</h2>
      <br />
      <h2>Select your power sources by plugging in the cables — you have up to 10 power lines.</h2>
      <br />
      <br />
      <h2>
        <strong>Use the controls</strong>
        {' '}
        to change your energy output as the
        {' '}
        <strong>demand bar</strong>
        {' '}
        moves up and down.
      </h2>
      <br />
      <br />
      <br />
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

export default ReadyScreen;
