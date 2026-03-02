import React, { useEffect, useState } from 'react';
import { get } from '@lib/network';
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

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DiskSpaceChart({ hostId }) {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    async function startDataFetching() {
      const { data: chartApiData } = await get(
        `charts/hosts/${hostId}/filesystem`
      );
      setChartData(chartApiData);
    }
    startDataFetching();
  }, []);

  const labels = keys(chartData);
  const used = map(
    values(chartData),
    ({ used_size }) => used_size / 1024 / 1014
  );
  const available = map(
    values(chartData),
    ({ avail_size }) => avail_size / 1024 / 1014
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Used Space (GB)',
        data: used, // The bottom segment
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
      {
        label: 'Available Space (GB)',
        data: available, // The top segment
        backgroundColor: 'rgba(178, 186, 186, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        stacked: true, // Groups the bars on top of each other
      },
      y: {
        stacked: true, // Ensures the Y-axis calculates the sum
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Capacity (GB)',
        },
      },
    },
    plugins: {
      tooltip: {
        mode: 'index', // Shows both Used and Available in one tooltip
        intersect: false,
      },
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'PC Filesystem Capacity (GB)',
      },
    },
  };

  return (
    <div style={{ width: '700px', margin: '0 auto' }}>
      <Bar options={options} data={data} />
    </div>
  );
}

export default DiskSpaceChart;
