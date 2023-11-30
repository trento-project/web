import { faker } from '@faker-js/faker';
import { eachMinuteOfInterval, subHours } from 'date-fns';
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
        'Array of datasets, a series of objects containing a value and a ISO8601 timestamp',
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

const timeFrames = eachMinuteOfInterval(
  { start: subHours(now, 5), end: now },
  { step: 2 }
);

const datasets = [
  {
    name: 'CPU',
    timeFrames: timeFrames.map((t) => ({
      time: t,
      value: faker.number.float({ min: 0, max: 100 }),
    })),
  },
];

export const Default = {
  args: {
    title: 'CPU',
    start: subHours(now, 5),
    end: now,
    // eslint-disable-next-line no-console
    onIntervalChange: (start, end) =>
      console.log(`Interval changed, start ${start} - end ${end}`),
    datasets,
  },
};
