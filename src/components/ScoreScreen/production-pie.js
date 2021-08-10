
import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import ChartColors from '../EnergyChart/chart-colors';
import { SumArray } from '../../utils';

const ProductionPie = ({ data }) => (
  <>
    <Doughnut
      data={ProductionPie.collatePieData(data)}
      options={ProductionPie.PieOptions}
    />
  </>
);

ProductionPie.PieOptions = {
  legend: {
    display: true,
    position: 'right',
    labels: {
      fontSize: 28,
      fontFamily: 'National',
    },
  },
  elements: {
    arc: {
      borderWidth: 0,
    },
  },
};

ProductionPie.collatePieData = (data) => {
  const labels = ['Coal', 'Natural gas', 'Hydro', 'Solar', 'Wind'];

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
    labels,
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
