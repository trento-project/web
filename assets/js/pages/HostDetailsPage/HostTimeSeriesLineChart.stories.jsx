// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import HostTimeSeriesLineChart from './HostTimeSeriesLineChart';

export default {
  title: 'Components/HostTimeSeriesLineChart',
  component: HostTimeSeriesLineChart,
  argTypes: {
    hostId: {
      description: 'Unique identifier for the host',
      control: { type: 'text' },
    },
    chartId: {
      description: 'Identifier for the chartId',
      control: { type: 'text' },
    },
    chartTitle: {
      description: 'The chartTitle prop',
      control: { type: 'text' },
    },
    yAxisFormatter: {
      description: 'The yAxisFormatter prop',
      control: { type: 'text' },
    },
    yAxisScaleType: {
      description: 'The yAxisScaleType prop',
      control: { type: 'text' },
    },
    yAxisMaxValue: {
      description: 'The yAxisMaxValue prop',
      control: { type: 'text' },
    },
    startInterval: {
      description: 'The startInterval prop',
      control: { type: 'text' },
    },
    endInterval: {
      description: 'The endInterval prop',
      control: { type: 'text' },
    },
    updateFrequency: {
      description: 'The updateFrequency prop',
      control: { type: 'text' },
    },
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    timezone: {
      description: 'The timezone prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    hostId: 'host-123',
    chartId: 'cpu',
    chartTitle: 'CPU',
    yAxisFormatter: (value) => `${value}%`,
    yAxisScaleType: 'linear',
    yAxisMaxValue: 100,
    startInterval: new Date(Date.now() - 3 * 60 * 60 * 1000),
    endInterval: new Date(),
    updateFrequency: 30000,
    className: 'w-1/2',
    timezone: 'Etc/UTC',
  },
};
