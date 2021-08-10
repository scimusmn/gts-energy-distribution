/* stylelint function-name-case: 0 */
import React from 'react';
import PropTypes from 'prop-types';

const Clouds = ({ wind, quantity }) => (
  <div className="clouds">
    {/* Displayed during little to no wind */}
    {Array(quantity).fill(<div className={`cloud still ${(wind <= 7) ? 'show' : ''}`} />)}
    {/* Displayed during medium wind */}
    {Array(quantity).fill(<div className={`cloud slow ${(wind > 7 && wind < 21) ? 'show' : ''}`} />)}
    {/* Displayed during strong wind */}
    {Array(quantity).fill(<div className={`cloud fast ${(wind >= 21) ? 'show' : ''}`} />)}
  </div>
);

Clouds.propTypes = {
  wind: PropTypes.number.isRequired,
  quantity: PropTypes.number.isRequired,
};

export default Clouds;
