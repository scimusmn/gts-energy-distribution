import React from 'react';
import PropTypes from 'prop-types';
// import { StaticImage } from 'gatsby-plugin-image';
import { Doughnut } from 'react-chartjs-2';
import ChartColors from '../EnergyChart/chart-colors';
import { SumArray } from '../../utils';

const ProductionPie = ({ data }) => (
  <div className="doughnut">
    <Doughnut
      data={ProductionPie.collatePieData(data)}
      options={ProductionPie.PieOptions}
    />
  </div>
);

ProductionPie.PieOptions = {
  legend: {
    display: false,
    position: 'right',
  },
  elements: {
    arc: {
      borderWidth: 0,
    },
  },
};

ProductionPie.collatePieData = (data) => {
  const {
    coal, gas, hydro, solar, wind,
  } = data;

  const energySums = [
    SumArray(coal),
    SumArray(gas),
    SumArray(hydro),
    SumArray(solar),
    SumArray(wind),
  ];

  const pieData = {
    maintainAspectRatio: false,
    responsive: false,
    datasets: [
      {
        data: energySums,
        backgroundColor: ChartColors,
        hoverBackgroundColor: ChartColors,
      },
    ],
  };

  return pieData;
};

ProductionPie.defaultProps = {
  data: {},
};

ProductionPie.propTypes = {
  data: PropTypes.instanceOf(Object),
};

export default ProductionPie;
