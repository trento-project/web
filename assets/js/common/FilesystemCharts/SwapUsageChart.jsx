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

function SwapUsageChart({ availBytes, usedBytes, totalBytes, className }) {
  const swapData = {
    labels: ['Used', 'Available'],
    datasets: [
      {
        data: [usedBytes, availBytes],
        backgroundColor: ['rgba(88, 207, 155, 1)', 'rgba(178, 186, 186, 0.7)'],
        borderColor: ['rgba(88, 207, 155, 1)', 'rgba(178, 186, 186, 0.7)'],
        borderWidth: 1,
      },
    ],
  };

  const swapChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
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

  const renderedTotal = totalBytes ? formatBytes(totalBytes) : 'N/A';

  return (
    <div
      className={classNames(
        'bg-white shadow rounded-lg mx-auto py-4 px-8 w-1/2',
        className
      )}
    >
      <h2 className="font-bold text-center text-xl">Swap Utilization</h2>
      <div className="flex items-center justify-center pt-6 h-[300px]">
        <div className="h-[92%]">
          <Doughnut data={swapData} options={swapChartOptions} />
        </div>
        <div className="ml-4 align-self-center">
          <p className="text-3xl font-bold">{renderedTotal}</p>
        </div>
      </div>
    </div>
  );
}

export default SwapUsageChart;
