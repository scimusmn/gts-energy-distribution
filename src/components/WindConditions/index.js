import React from 'react';
import { Container, Row } from 'reactstrap';
import PropTypes from 'prop-types';

const WindConditions = ({ wind }) => (
  <Container className={`current-conditions pane window wind ${wind < 8 ? 'disable' : ''}`}>
    <Row>
      <div className="condition-icon" />
    </Row>
    <Row>
      <h2 className="highlight">{`${wind} MPH`}</h2>
    </Row>
    <Row>
      <h3 className="highlight">Wind</h3>
    </Row>
  </Container>
);

WindConditions.propTypes = {
  wind: PropTypes.number.isRequired,
};

export default WindConditions;
