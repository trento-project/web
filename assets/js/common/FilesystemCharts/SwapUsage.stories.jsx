import React from 'react';
import SwapUsage from './SwapUsage';

export default {
  title: 'Components/FilesystemCharts/SwapUsage',
  component: SwapUsage,
  argTypes: {
    availBytes: {
      description: 'Available swap in bytes',
      control: { type: 'number' },
    },
    usedBytes: {
      description: 'Used swap in bytes',
      control: { type: 'number' },
    },
    totalBytes: {
      description: 'Total swap in bytes',
      control: { type: 'number' },
    },
  },
  render: (args) => <SwapUsage {...args} className="w-full h-[400px]" />,
};

export const Default = {
  args: {
    availBytes: 1073741824, // 1 GB
    usedBytes: 536870912, // 0.5 GB
    totalBytes: 2147483648, // 2 GB
  },
};

export const MostlyUsed = {
  args: {
    availBytes: 214748364, // 0.2 GB
    usedBytes: 1932735284, // 1.8 GB
    totalBytes: 2147483648, // 2 GB
  },
};

export const NoUsage = {
  args: {
    availBytes: 2147483648, // 2 GB
    usedBytes: 0,
    totalBytes: 2147483648, // 2 GB
  },
};

export const ZeroTotal = {
  args: {
    availBytes: 0,
    usedBytes: 0,
    totalBytes: 0,
  },
};
