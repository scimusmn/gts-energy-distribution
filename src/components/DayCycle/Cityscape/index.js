/* stylelint function-name-case: 0 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Spritesheet from 'react-responsive-spritesheet';

import coalImg from '../../../images/animations/coal.png';
import gasImg from '../../../images/animations/gas.png';
import hydroImg from '../../../images/animations/hydro.png';
import windImg from '../../../images/animations/wind.png';
import solarImg from '../../../images/animations/solar.png';

const Cityscape = ({
  wind, solar, coal, gas, hydro, night, lights,
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

  const coalRef1 = React.useRef(null);
  const coalRef2 = React.useRef(null);
  const gasRef = React.useRef(null);
  const hydroRef1 = React.useRef(null);
  const hydroRef2 = React.useRef(null);
  const solarRef = React.useRef(null);
  const windRef1 = React.useRef(null);
  const windRef2 = React.useRef(null);

  useEffect(() => spriteEffect(coalRef1, coal), [coal]);
  useEffect(() => spriteEffect(coalRef2, coal), [coal]);
  useEffect(() => spriteEffect(gasRef, gas), [gas]);
  useEffect(() => spriteEffect(hydroRef1, hydro), [hydro]);
  useEffect(() => spriteEffect(hydroRef2, hydro), [hydro]);
  useEffect(() => spriteEffect(solarRef, solar), [solar]);
  useEffect(() => spriteEffect(windRef1, wind), [wind]);
  useEffect(() => spriteEffect(windRef2, wind), [wind]);

  return (
    <div className="background-city">
      <div className="backdrop day" />
      <div className={`backdrop night ${night ? 'show' : ''}`} />
      <div className={`backdrop night-lights ${lights ? 'show' : ''}`} />
      <Spritesheet
        ref={coalRef1}
        className="coal-sprite-1"
        image={coalImg}
        widthFrame={166}
        heightFrame={166}
        steps={24}
        fps={24}
        autoplay={false}
        loop
      />
      <Spritesheet
        ref={coalRef2}
        className="coal-sprite-2"
        image={coalImg}
        widthFrame={166}
        heightFrame={166}
        steps={24}
        fps={24}
        autoplay={false}
        loop
      />
      <Spritesheet
        ref={gasRef}
        className="gas-sprite"
        image={gasImg}
        widthFrame={64}
        heightFrame={126}
        steps={20}
        fps={24}
        autoplay={false}
        loop
      />
      <Spritesheet
        ref={hydroRef1}
        className="hydro-sprite-1"
        image={hydroImg}
        widthFrame={159}
        heightFrame={131}
        steps={30}
        fps={24}
        autoplay={false}
        loop
      />
      <Spritesheet
        ref={hydroRef2}
        className="hydro-sprite-2"
        image={hydroImg}
        widthFrame={159}
        heightFrame={131}
        steps={30}
        fps={24}
        autoplay={false}
        loop
      />
      <Spritesheet
        ref={windRef1}
        className="wind-sprite-1"
        image={windImg}
        widthFrame={143}
        heightFrame={176}
        steps={32}
        fps={24}
        autoplay={false}
        loop
      />
      <Spritesheet
        ref={windRef2}
        className="wind-sprite-2"
        image={windImg}
        widthFrame={143}
        heightFrame={176}
        steps={32}
        fps={24}
        autoplay={false}
        loop
      />
      <Spritesheet
        ref={solarRef}
        className="solar-sprite"
        image={solarImg}
        widthFrame={179}
        heightFrame={153}
        steps={24}
        fps={24}
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
  night: PropTypes.bool.isRequired,
  lights: PropTypes.bool.isRequired,
};

export default Cityscape;
