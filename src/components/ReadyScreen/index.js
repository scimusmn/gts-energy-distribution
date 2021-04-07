/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const ReadyScreen = () => (
  <Modal isOpen size="xl">
    <ModalHeader><h1>Power the city!</h1></ModalHeader>
    <ModalBody>
      <h3>Can you power the city for 3 days?</h3>
      <br />
      <h3>Select your power sources by plugging in the cables — you have up to 10 power lines.</h3>
      <br />
      <h3>
        As the city’s power demand changes, use the controls to match production to demand.
        <br />
        Some power sources respond more quickly than others,
        and power from the wind and sun will change depending on the weather.
      </h3>
      <br />
      <h3>
        Beware! Disconnecting a power line might cause an outage.
        Keep an eye on your demand and efficiency.
      </h3>
      <br />
    </ModalBody>
    <ModalFooter>
      <h1>
        Ready to play? Press
        {' '}
        <strong>START.</strong>
      </h1>
    </ModalFooter>
  </Modal>
);

export default ReadyScreen;
