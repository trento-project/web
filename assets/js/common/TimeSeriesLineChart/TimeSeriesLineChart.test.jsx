import React from 'react';

import { render } from '@testing-library/react';
import TimeSeriesLineChart from './TimeSeriesLineChart';
import '@testing-library/jest-dom';

jest.mock('react-chartjs-2', () => ({
  Line: () => <canvas />,
}));

describe('TimeSeriesLineChart component', () => {
  it('should raise an error if the datasets are more then 5', () => {
    const datasets = [
      {
        name: 'Data 1',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
      {
        name: 'Data 2',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
      {
        name: 'Data 3',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
      {
        name: 'Data 4',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
      {
        name: 'Data 5',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
      {
        name: 'Data 6',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
      {
        name: 'Data 7',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
    ];

    const timeNow = new Date();

    expect(() =>
      render(
        <div>
          <TimeSeriesLineChart
            title="test chart"
            start={timeNow}
            end={timeNow}
            datasets={datasets}
            onIntervalChange={() => {}}
          />
        </div>
      )
    ).toThrow('TimeSeriesLineChart component supports a maximum of 6 datasets');
  });

  it('should render with the appropriate props', () => {
    const datasets = [
      {
        name: 'Data 1',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
      {
        name: 'Data 2',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
      {
        name: 'Data 3',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
      {
        name: 'Data 4',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
      {
        name: 'Data 5',
        timeFrames: [{ time: new Date(), value: 0.0 }],
      },
    ];

    const timeNow = new Date();

    const { container } = render(
      <div>
        <TimeSeriesLineChart
          title="test chart"
          start={timeNow}
          end={timeNow}
          datasets={datasets}
          onIntervalChange={() => {}}
        />
      </div>
    );

    expect(container.querySelector('canvas')).toBeDefined();
  });
});
