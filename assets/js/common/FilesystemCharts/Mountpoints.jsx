import React from 'react';
import classNames from 'classnames';

import { keys, values, map } from 'lodash';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatBytes } from '@lib/charts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Mountpoints({ mountpoints, className }) {
  const mountpointsLabels = keys(mountpoints);
  const used = map(values(mountpoints), ({ usedBytes }) => usedBytes);
  const available = map(values(mountpoints), ({ availBytes }) => availBytes);

  const mountpointsData = {
    labels: mountpointsLabels,
    datasets: [
      {
        label: 'Used Space',
        data: used,
        backgroundColor: 'rgba(88, 207, 155, 1)',
      },
      {
        label: 'Available Space',
        data: available,
        backgroundColor: 'rgba(178, 186, 186, 0.7)',
      },
    ],
  };

  const mountpointsChartOptions = {
    responsive: true,
    scales: {
      x: {
        stacked: true, // Groups the bars on top of each other
      },
      y: {
        stacked: true, // Ensures the Y-axis calculates the sum
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            return formatBytes(value);
          },
        },
      },
    },
    plugins: {
      tooltip: {
        mode: 'index', // Shows both Used and Available in one tooltip
        intersect: false,
        callbacks: {
          beforeBody(tooltipItem) {
            const mountpoint = tooltipItem[0].label;
            const device = mountpoints[mountpoint].device;
            return `Device: ${device}`;
          },
          label(tooltipItem) {
            const label = tooltipItem.dataset.label;
            const rawValue = tooltipItem.raw;
            const deviceSpace = formatBytes(rawValue);
            return `${label}: ${deviceSpace}`;
          },
        },
      },
      legend: {
        position: 'bottom',
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
      <h2 className="font-bold text-center text-xl">File System Capacity</h2>
      <div className="pt-6 relative text-center h-[92%] w-full flex justify-center h-[350px]">
        <Bar options={mountpointsChartOptions} data={mountpointsData} />
      </div>
    </div>
  );
}

export default Mountpoints;
