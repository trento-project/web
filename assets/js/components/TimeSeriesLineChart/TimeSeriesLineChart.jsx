import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ZoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import classNames from 'classnames';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  ZoomPlugin
);

function TimeSeriesLineChart({
  title,
  datasets,
  start,
  end,
  chartWrapperClassNames,
  className,
  onIntervalChange,
}) {
  const [chartDatasets, setChartDatasets] = useState([]);

  useEffect(() => {
    const newDatasets = datasets.map((d) => ({
      label: d.name,
      data: d.timeFrames.map(({ time, value }) => ({
        x: time,
        y: value,
      })),
      borderColor: '#A5EED4',
      pointBackgroundColor: '#58CF9B',
      pointBorderColor: '#30BA78',
      pointRadius: 5,
      pointHoverRadius: 8,
    }));

    setChartDatasets(newDatasets);
  }, [datasets]);

  const onZoomChange = ({
    chart: {
      scales: { x },
    },
  }) => onIntervalChange(x.min, x.max);

  const zoomOptions = {
    limits: {
      x: { min: 'original', max: 'original', minRange: 60 * 1000 },
    },
    pan: {
      enabled: true,
      mode: 'x',
      modifierKey: 'ctrl',
      onPanComplete: onZoomChange,
    },
    zoom: {
      wheel: {
        enabled: true,
      },
      drag: {
        enabled: true,
      },
      mode: 'x',
      onZoomComplete: onZoomChange,
    },
  };

  const scales = {
    x: {
      position: 'bottom',
      min: start,
      max: end,
      type: 'time',
      ticks: {
        autoSkip: true,
        autoSkipPadding: 50,
        maxRotation: 0,
      },
      time: {
        displayFormats: {
          hour: 'HH:mm',
          minute: 'HH:mm',
          second: 'HH:mm:ss',
        },
      },
    },
    y: {
      type: 'linear',
      position: 'left',
    },
  };

  const options = {
    scales,
    responsive: true,
    plugins: {
      legend: false,
      zoom: zoomOptions,
    },
  };

  return (
    <div
      className={classNames(
        'mt-4 bg-white shadow rounded-lg py-4 px-8 mx-auto',
        className
      )}
    >
      <h2 className="font-bold text-center text-xl"> {title} </h2>
      <div
        className={classNames(
          'pt-6 relative text-center h-[90%] w-full flex justify-center',
          chartWrapperClassNames
        )}
      >
        <Line options={options} data={{ datasets: chartDatasets }} />
      </div>
    </div>
  );
}

export default TimeSeriesLineChart;
