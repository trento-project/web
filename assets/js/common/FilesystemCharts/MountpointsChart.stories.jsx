import React from 'react';
import MountpointsChart from './MountpointsChart';

export default {
  title: 'Components/FilesystemCharts/MountpointsChart',
  component: MountpointsChart,
  argTypes: {
    mountpoints: {
      description: 'An object containing information about each mountpoint',
      control: { type: 'object' },
    },
  },
  render: (args) => <MountpointsChart {...args} className="w-full h-[400px]" />,
};

export const Default = {
  args: {
    mountpoints: {
      '/': {
        usedBytes: 8589934592, // 8 GB
        availBytes: 12884901888, // 12 GB
        device: '/dev/sda1',
      },
      '/home': {
        usedBytes: 53687091200, // 50 GB
        availBytes: 53687091200, // 50 GB
        device: '/dev/sda2',
      },
      '/boot/efi': {
        usedBytes: 52428800, // 50 MB
        availBytes: 471859200, // 450 MB
        device: '/dev/nvme0n1p1',
      },
      '/var/log': {
        usedBytes: 2147483648, // 2GB
        availBytes: 8589934592, // 8GB
        device: '/dev/mapper/system-var_log',
      },
    },
  },
};

export const FullDisk = {
  args: {
    mountpoints: {
      ...Default.args.mountpoints,
      '/data': {
        usedBytes: 1099511627776, // 1 TB
        availBytes: 1073741824, // 1 GB
        device: '/dev/sdb1',
      },
    },
  },
};

export const NoData = {
  args: {
    mountpoints: {},
  },
};
