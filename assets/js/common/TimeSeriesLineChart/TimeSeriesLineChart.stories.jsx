/* eslint-disable no-console */
import React, { useEffect, useRef, useState } from 'react';
import { faker } from '@faker-js/faker';
import {
  addMinutes,
  addSeconds,
  eachMinuteOfInterval,
  subHours,
  subMinutes,
} from 'date-fns';
import TimeSeriesLineChart from './TimeSeriesLineChart';

const now = new Date();

/**
 * TimeSeriesLineChart is a specialized line chart.
 *
 * It should be used for timeseries representation.
 * On the X we have time, on the Y the value associated with time.
 *
 * The input data are a series of object, containing a timestamp and a value associated to the timestamp.
 *
 * Timestamp are plain js Date object, values are numbers.
 *
 * The timeseries chart offers zoom and sub-selection of time intervals, a prop function is called with the selected range.
 *
 */
export default {
  title: 'Components/TimeSeriesLineChart',
  component: TimeSeriesLineChart,
  argTypes: {
    title: {
      description: 'Chart title',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    start: {
      description: 'Start of the time interval, as Date object',
      control: { type: 'date' },
    },
    end: {
      description: 'End of the time interval, as Date object',
      control: { type: 'date' },
    },
    datasets: {
      description:
        'Array of datasets, a series of objects containing a value and a Date',
      control: { type: 'array' },
    },
    chartWrapperClassNames: {
      description: 'Classnames for the parent of chart canvas',
    },
    className: {
      description: 'Classname for component',
    },
    onIntervalChange: {
      description:
        'Callback called with the selected/zoomed time interval, check the console',
    },
  },
};

const defaultTimeframes = eachMinuteOfInterval(
  { start: subHours(now, 5), end: now },
  { step: 2 }
);

const buildDatasets = (timeFrames) => [
  {
    name: 'Busy User',
    timeFrames: timeFrames.map((t) => ({
      time: t,
      value: faker.number.float({ min: 0, max: 100 }),
    })),
  },
  {
    name: 'Busy System',
    timeFrames: timeFrames.map((t) => ({
      time: t,
      value: faker.number.float({ min: 20, max: 30 }),
    })),
  },
  {
    name: 'I/O',
    timeFrames: timeFrames.map((t) => ({
      time: t,
      value: faker.number.float({ min: 0, max: 50 }),
    })),
  },
  {
    name: 'Other Cpu Value',
    timeFrames: timeFrames.map((t) => ({
      time: t,
      value: faker.number.float({ min: 0, max: 20 }),
    })),
  },
  {
    name: 'Another Value',
    timeFrames: timeFrames.map((t) => ({
      time: t,
      value: faker.number.float({ min: 10, max: 200 }),
    })),
  },
];

export const Default = {
  args: {
    title: 'CPU',
    start: subHours(now, 5).toISOString(),
    end: now.toISOString(),
    onIntervalChange: (start, end) =>
      // eslint-disable-next-line no-console
      console.log(`Interval changed, start ${start} - end ${end}`),
    datasets: buildDatasets(defaultTimeframes),
  },
};

function ChartUpdaterWrapper(props) {
  const defaultStart = new Date();
  const chartRef = useRef(null);

  const initialTimeFrames = eachMinuteOfInterval({
    start: subMinutes(defaultStart, 5),
    end: addSeconds(now, 10),
  });

  const [datasets, setDasatets] = useState(buildDatasets(initialTimeFrames));
  const [interval, setChartInterval] = useState({
    start: subMinutes(defaultStart, 5),
    end: addMinutes(defaultStart, 1),
  });

  const handleIntervalChange = (start, end) => {
    console.log(`Interval changed, start ${start} - end ${end}`);
  };

  useEffect(() => {
    const chartJsInstance = chartRef.current;

    setInterval(() => {
      const timeNow = new Date();
      const newInterval = {
        start: subMinutes(timeNow, 5),
        end: addMinutes(timeNow, 1),
      };
      const newFetchInterval = eachMinuteOfInterval({
        start: timeNow,
        end: addSeconds(timeNow, 10),
      });

      const newDatasets = datasets.map((d) => ({
        ...d,
        timeFrames: [
          ...d.timeFrames,
          ...newFetchInterval.map((t) => ({
            time: t,
            value: faker.number.float({ min: 10, max: 200 }),
          })),
        ],
      }));

      console.log('zoom level', chartJsInstance.getZoomLevel());
      if (chartJsInstance.getZoomLevel() < 3.5) {
        console.log('Updating interval, chart is not zoomed');
        setChartInterval(newInterval);
        setDasatets(newDatasets);
        console.log('Data updated!');
      } else {
        console.log(
          'Chart zoomed too much, skipping updating',
          chartJsInstance.getZoomLevel()
        );
      }
    }, 20000);
  }, []);

  return (
    <TimeSeriesLineChart
      {...props}
      datasets={datasets}
      start={interval.start}
      end={interval.end}
      chartRef={chartRef}
      onIntervalChange={handleIntervalChange}
    />
  );
}

/**
 * Data updates every 20s
 */
export const WithUpdates = {
  args: {
    title: 'CPU',
  },
  render: (args) => <ChartUpdaterWrapper {...args} />,
};
