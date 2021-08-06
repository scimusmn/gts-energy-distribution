import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import GaugeChart from 'react-gauge-chart';
import PropTypes from 'prop-types';
import Settings from '../../data/settings';
import PowerMeter from '../PowerMeter';
import MeterDiff from '../MeterDiff';

const PowerLevels = ({
  demand, production, efficiency,
}) => (
  <Container className="power-levels window pane">
    <Row>
      <MeterDiff
        level1={production}
        level2={demand}
        maxlevel={Settings.MAX_EXPECTED_DEMAND}
        barheight={590}
        efficiency={efficiency}
      />
      <PowerMeter label="Production" color="#43B94F" level={production} maxlevel={Settings.MAX_EXPECTED_DEMAND} barheight={590} />
      <PowerMeter label="Demand" color="#FB3D08" level={demand} maxlevel={Settings.MAX_EXPECTED_DEMAND} barheight={590} />
    </Row>
    <br />
    <Row>
      <Col style={{ textAlign: 'center' }}>
        <br />
        <GaugeChart
          id="gauge-efficiency"
          percent={efficiency}
          colors={['#F9000F', '#FFD02A', '#34BF3E']}
          animDelay={0}
          hideText
        />
        <h3>
          How are you doing?
        </h3>
      </Col>
    </Row>
  </Container>
);

PowerLevels.propTypes = {
  production: PropTypes.number.isRequired,
  demand: PropTypes.number.isRequired,
  efficiency: PropTypes.number.isRequired,
};

export default PowerLevels;
