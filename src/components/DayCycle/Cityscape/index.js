/* stylelint function-name-case: 0 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Spritesheet from 'react-responsive-spritesheet';

const Cityscape = ({
  wind, solar, coal, gas, hydro,
}) => {
  const spriteEffect = (ref, active) => {
    if (ref.current) {
      if (active) {
        ref.current.play();
      } else {
        ref.current.pause();
      }
    }
  };

  const coalRef = React.useRef(null);
  const gasRef = React.useRef(null);
  const hydroRef = React.useRef(null);
  const solarRef = React.useRef(null);
  const windRef = React.useRef(null);

  useEffect(() => spriteEffect(coalRef, coal), [coal]);
  useEffect(() => spriteEffect(gasRef, gas), [gas]);
  useEffect(() => spriteEffect(hydroRef, hydro), [hydro]);
  useEffect(() => spriteEffect(solarRef, solar), [solar]);
  useEffect(() => spriteEffect(windRef, wind), [wind]);

  return (
    <div className="background-city">
      <Spritesheet
        ref={coalRef}
        className="coal-sprite"
        image="animations/coal.png"
        widthFrame={420}
        heightFrame={500}
        steps={14}
        fps={10}
        autoplay={false}
        loop
      />
      <Spritesheet
        ref={gasRef}
        className="gas-sprite"
        image="animations/gas.png"
        widthFrame={420}
        heightFrame={500}
        steps={14}
        fps={10}
        autoplay={false}
        loop
      />
      <Spritesheet
        ref={hydroRef}
        className="hydro-sprite"
        image="animations/hydro.png"
        widthFrame={420}
        heightFrame={500}
        steps={14}
        fps={10}
        autoplay={false}
        loop
      />
      <Spritesheet
        ref={windRef}
        className="wind-sprite"
        image="animations/wind.png"
        widthFrame={420}
        heightFrame={500}
        steps={14}
        fps={10}
        autoplay={false}
        loop
      />
      <Spritesheet
        ref={solarRef}
        className="solar-sprite"
        image="animations/solar.png"
        widthFrame={420}
        heightFrame={500}
        steps={14}
        fps={10}
        autoplay={false}
        loop
      />

    </div>
  );
};


Cityscape.propTypes = {
  wind: PropTypes.bool.isRequired,
  solar: PropTypes.bool.isRequired,
  coal: PropTypes.bool.isRequired,
  gas: PropTypes.bool.isRequired,
  hydro: PropTypes.bool.isRequired,
};

export default Cityscape;
