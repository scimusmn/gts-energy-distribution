/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { StaticImage } from 'gatsby-plugin-image';
import {
  Modal, ModalBody,
} from 'reactstrap';

const ReadyScreen = ({ currentView }) => (
  <Modal isOpen size={`${currentView !== 'ready4' ? 'xl' : 'l'}`} className="pane">
    <ModalBody>
      {{
        ready1: (
          <div>
            <h1>ENERGY MANAGEMENT</h1>
            <h2>
              Can you power the city
              <br />
              and keep your citizens happy?
            </h2>
            <br />
            <br />
            <h3>Continue?</h3>
            <h4>PRESS OK.</h4>
            <br />
          </div>),
        ready2: (
          <div>
            <StaticImage src="../../images/intro-plug-in.png" alt="" />
            <br />
            <h2>Plug in your power lines.</h2>
            <h2 className="highlight">You can choose up to 10.</h2>
            <br />
            <br />
            <h3>Continue?</h3>
            <h4>PRESS OK.</h4>
            <br />
          </div>),
        ready3: (
          <div>
            <br />
            <StaticImage src="../../images/intro-control.png" alt="" />
            <br />
            <h2>
              <span className="highlight">Use the controls</span>
              {' '}
              to match your
              <br />
              energy output to the changing
              <br />
              demand throughout the day.
            </h2>
            <br />
            <br />
            <h3>Continue?</h3>
            <h4>PRESS OK.</h4>
            <br />
          </div>),
        ready4: (
          <div>
            <br />
            <br />
            <h3>Ready to play?</h3>
            <h4>PRESS OK.</h4>
            <br />
            <br />
          </div>),
      }[currentView]}
    </ModalBody>
  </Modal>
);

ReadyScreen.propTypes = {
  currentView: PropTypes.string.isRequired,
};

export default ReadyScreen;
