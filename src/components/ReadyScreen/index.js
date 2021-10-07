/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { StaticImage } from 'gatsby-plugin-image';
import {
  Modal, ModalBody,
} from 'reactstrap';

// size={`${currentView !== 'ready5' ? 'xl' : 'lg'}`} className="pane">
const ReadyScreen = ({ currentView }) => {
  let size = 'lg';
  if (currentView === 'ready2' || currentView === 'ready4') size = 'xl';

  return (
    <Modal isOpen size={size} className="pane">
      <ModalBody>
        {{
          ready1: (
            <div>
              <h1 className="title">
                Power
                <br />
                your city!
              </h1>
              <h2>
                Can you power the city
                and keep your citizens&nbsp;happy?
              </h2>
              <br />
              <br />
              <h3>
                <strong>Press OK</strong>
                <br />
                to continue
              </h3>
              <br />
            </div>),
          ready2: (
            <div>
              <h2 style={{ marginBottom: '25px' }}>
                <strong>
                  <span className="caret">&gt;&gt;</span>
                  Choose your power sources carefully.
                  <span className="caret">&lt;&lt;</span>
                </strong>
              </h2>
              <div className="icon-box">
                <div>
                  <StaticImage src="../../images/coal-icon.png" alt="" height={75} />
                  <h3>Coal</h3>
                </div>
                <div>
                  <StaticImage src="../../images/gas-icon.png" alt="" height={75} />
                  <h3>Natural gas</h3>
                </div>
                <div>
                  <StaticImage src="../../images/hydro-icon.png" alt="" height={75} />
                  <h3>Hydroelectric</h3>
                </div>
                <div>
                  <StaticImage src="../../images/solar-icon.png" alt="" height={75} />
                  <h3>Solar</h3>
                </div>
                <div>
                  <StaticImage src="../../images/wind-icon.png" alt="" height={75} />
                  <h3>Wind</h3>
                </div>
              </div>
              <h3 style={{ marginTop: '25px' }}>
                Coal, natural gas, and hydroelectric plants can be controlled
                to match your needs — coal just takes a little while to start up.
              </h3>
              <h3 style={{ marginTop: '25px' }}>
                Solar and wind power are great renewable sources
                <br />
                when the weather is right.
              </h3>
              <br />
              <br />
              <h3>
                <strong>Press OK</strong>
                <br />
                to continue
              </h3>
              <br />
            </div>),
          ready3: (
            <div>
              <StaticImage src="../../images/intro-plug-in.png" alt="" height={500} />
              <br />
              <h2>Plug in your power lines.</h2>
              <h2 className="highlight">You can choose up to 10.</h2>
              <br />
              <br />
              <h3>
                <strong>Press OK</strong>
                <br />
                to continue
              </h3>
              <br />
            </div>),
          ready4: (
            <div>
              <br />
              <div style={{ marginLeft: '75px' }}>
                <StaticImage src="../../images/intro-control.png" alt="" height={500} />
              </div>
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
              <h3>
                <strong>Press OK</strong>
                <br />
                to continue
              </h3>
              <br />
            </div>),
          ready5: (
            <div>
              <br />
              <br />
              <h3>
                <strong>Press OK</strong>
                <br />
                to begin
              </h3>
              <br />
              <br />
            </div>),
        }[currentView]}
      </ModalBody>
    </Modal>
  );
};

ReadyScreen.propTypes = {
  currentView: PropTypes.string.isRequired,
};

export default ReadyScreen;
