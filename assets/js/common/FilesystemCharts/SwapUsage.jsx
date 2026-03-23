import React from 'react';
import classNames from 'classnames';

import {
  Chart as ChartJS,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatBytes } from '@lib/charts';

ChartJS.register(CategoryScale, ArcElement, Title, Tooltip, Legend);

function SwapUsage({ availBytes, usedBytes, totalBytes, className }) {
  const swapData = {
    labels: ['Available', 'Used'],
    datasets: [
      {
        data: [availBytes, usedBytes],
        backgroundColor: ['rgba(48,186,120, 1)', 'rgba(165, 238, 212, 1)'],
        borderColor: ['rgba(48,186,120, 1)', 'rgba(165, 238, 212, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const swapChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        color: 'black',
        text: formatBytes(totalBytes),
        font: {
          family: 'Lato',
          weight: 700,
          size: 32,
        },
      },
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label(tooltipItem) {
            const rawValue = tooltipItem.raw;
            const deviceSpace = formatBytes(rawValue);
            const percentage = ((rawValue / totalBytes) * 100).toFixed(2);
            return `${deviceSpace} - ${percentage}%`;
          },
        },
      },
    },
  };

  return (
    <div
      className={classNames(
        'bg-white shadow rounded-lg mx-auto py-4 px-8 w-1/2',
        className
      )}
    >
      <h2 className="font-bold text-center text-xl">Swap</h2>
      <div className="pt-6 relative text-center h-[92%] w-full flex justify-center h-[350px]">
        <Doughnut data={swapData} options={swapChartOptions} />
      </div>
    </div>
  );
}

export default SwapUsage;
