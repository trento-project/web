// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import classNames from 'classnames';

import { keys, values, map, uniq, flow, orderBy, pickBy, xor } from 'lodash';

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

import Pill from '@common/Pill';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const initialActiveFsTypes = ['gpfs', 'nfs', 'xfs', 'nfs4'];

// getFsTypes gets all uniq and sorted filesystem types from
// the given mountpoints
const getFsTypes = flow([values, (arr) => map(arr, 'fsType'), uniq, orderBy]);

function MountpointsChart({ mountpoints, className }) {
  // Get all FS types and store in state as initial selected types
  const allFsTypes = getFsTypes(mountpoints);
  const initialFsTypes = allFsTypes.filter((fsType) =>
    initialActiveFsTypes.includes(fsType)
  );

  const [selectedTypes, setSelectedTypes] = useState(initialFsTypes);

  // Filter the mountpoints based on selection
  const filteredMountpoints = pickBy(mountpoints, (mountpoint) =>
    selectedTypes.includes(mountpoint.fsType)
  );

  const mountpointsLabels = keys(filteredMountpoints);
  const used = map(values(filteredMountpoints), ({ usedBytes }) => usedBytes);
  const available = map(
    values(filteredMountpoints),
    ({ availBytes }) => availBytes
  );

  const toggleType = (type) => {
    setSelectedTypes((prev) => xor(prev, [type]));
  };

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
            const currentMountpoint = filteredMountpoints[mountpoint];
            const device = currentMountpoint.device;
            const fsType = currentMountpoint.fsType;
            return `Device: ${device}\nFS type: ${fsType}`;
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
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {allFsTypes.map((type) => (
          <Pill
            key={type}
            onClick={() => toggleType(type)}
            className={classNames(
              'cursor-pointer bg-green-100 text-green-800',
              {
                'opacity-50': !selectedTypes.includes(type),
              }
            )}
          >
            {type}
          </Pill>
        ))}
      </div>
      <div className="pt-6 relative text-center h-[92%] w-full flex justify-center h-[350px]">
        <Bar options={mountpointsChartOptions} data={mountpointsData} />
      </div>
    </div>
  );
}

export default MountpointsChart;
