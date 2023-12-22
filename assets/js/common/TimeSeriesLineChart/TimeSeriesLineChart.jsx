import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  LogarithmicScale,
  PointElement,
  TimeScale,
  Tooltip,
} from 'chart.js';
import ZoomPlugin from 'chartjs-plugin-zoom';
import classNames from 'classnames';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';

const AVAILABLE_COLORS = [
  {
    line: '#A5EED4',
    point: '#58CF9B',
  },
  {
    line: '#FEF08A',
    point: '#FACC15',
  },
  {
    line: '#FECACA',
    point: '#F87171',
  },
  {
    line: '#BFDBFE',
    point: '#60A5FA',
  },
  {
    line: '#E5E7EB',
    point: '#9CA3AF',
  },
  {
    line: '#004DCF',
    point: '#1273DE',
  },
];

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Legend,
  LogarithmicScale,
  Tooltip,
  ZoomPlugin
);

function TimeSeriesLineChart({
  chartRef,
  chartWrapperClassNames,
  className,
  datasets,
  end,
  onIntervalChange,
  start,
  title,
  yAxisMaxValue,
  yAxisLabelFormatter = (value) => value,
  yAxisScaleType = 'linear',
}) {
  const onZoomChange = ({
    chart: {
      scales: { x },
    },
  }) => onIntervalChange(x.min, x.max);

  const [chartDatasets, setChartDatasets] = useState([]);
  const [zoomOptions, setZoomOptions] = useState({
    limits: {
      x: { min: 'original', max: 'original', minRange: 60 * 1000 },
    },
    zoom: {
      wheel: {
        enabled: true,
      },
      drag: {
        enabled: true,
      },
      pan: {
        enabled: false,
      },
      mode: 'x',
      onZoomComplete: onZoomChange,
      // Prevent zoom reset on legend change, https://github.com/chartjs/chartjs-plugin-zoom/issues/256#issuecomment-1826812558
      onZoomStart: (e) =>
        e.point.x > e.chart.chartArea.left &&
        e.point.x < e.chart.chartArea.right &&
        e.point.y > e.chart.chartArea.top &&
        e.point.y < e.chart.chartArea.bottom,
    },
  });

  useEffect(() => {
    const newDatasets = datasets.map((d, i) => ({
      label: d.name,
      data: d.timeFrames.map(({ time, value }) => ({
        x: time,
        y: value,
      })),
      borderColor: AVAILABLE_COLORS[i].line,
      pointBackgroundColor: AVAILABLE_COLORS[i].point,
      pointBorderWidth: 0,
      pointRadius: 1.8,
      pointHoverRadius: 8,
    }));

    setChartDatasets(newDatasets);
  }, [datasets]);

  useEffect(() => {
    setZoomOptions((currentOptions) => ({
      ...currentOptions,
      limits: {
        x: {
          ...currentOptions.x,
          min: start.getTime(),
          max: end.getTime(),
        },
      },
    }));
  }, [start, end]);

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
      type: yAxisScaleType,
      position: 'left',
      max: yAxisMaxValue,
      ticks: {
        callback: yAxisLabelFormatter,
      },
    },
  };

  const options = {
    scales,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        titleAlign: 'center',
        bodyAlign: 'center',
        footerAlign: 'center',
        displayColors: 'false',
      },
      legend: {
        position: 'bottom',
      },
    },
  };

  if (datasets.length > 6) {
    throw new Error(
      'TimeSeriesLineChart component supports a maximum of 6 datasets'
    );
  }

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
        <Line
          ref={chartRef}
          options={{
            ...options,
            plugins: { ...options.plugins, zoom: zoomOptions },
          }}
          data={{ datasets: chartDatasets }}
        />
      </div>
    </div>
  );
}

export default TimeSeriesLineChart;
