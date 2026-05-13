// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

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
import SwapNotConfigured from '@static/empty-doughnut-chart.svg';

ChartJS.register(CategoryScale, ArcElement, Title, Tooltip, Legend);

const usedColor = 'rgba(88, 207, 155, 1)';
const availableColor = 'rgba(178, 186, 186, 0.7)';

function SwapUsageChart({ availBytes, usedBytes, totalBytes, className }) {
  const isSwapConfigured = Boolean(totalBytes);

  const swapData = {
    labels: ['Used', 'Available'],
    datasets: [
      {
        data: [usedBytes, availBytes],
        backgroundColor: [usedColor, availableColor],
        borderColor: [usedColor, availableColor],
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

  return (
    <div
      className={classNames(
        'bg-white shadow rounded-lg mx-auto py-4 px-8 w-1/2',
        className
      )}
    >
      <h2 className="font-bold text-center text-xl">Swap Utilization</h2>
      {isSwapConfigured ? (
        <div className="flex items-center justify-center pt-6 h-[300px]">
          <div className="h-[92%]">
            <Doughnut data={swapData} options={swapChartOptions} />
          </div>

          <div className="ml-4 align-self-center">
            <p className="text-3xl font-bold">{formatBytes(totalBytes)}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center pt-6 h-[300px]">
            <img
              className="h-[92%] inline-block align-middle"
              alt="swap-not-configured"
              src={SwapNotConfigured}
            />
          </div>
          <div className="flex items-center justify-center pt-3 mb-3">
            <p className="text-2xl font-bold">Swap Not Configured</p>
          </div>
        </>
      )}
    </div>
  );
}

export default SwapUsageChart;
