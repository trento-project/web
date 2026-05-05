import { sbdDevicesFactory } from '@lib/test-utils/factories';
import ClusterDetails from '.';

export default {
  title: 'Components/SBDDetails',
  component: ClusterDetails,
  argTypes: {
    sbdDevices: {
      description: 'The sbdDevices prop',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    sbdDevices: sbdDevicesFactory.buildList(2, { status: 'healthy' }),
  },
};

export const Unhealthy = {
  args: {
    sbdDevices: sbdDevicesFactory.buildList(2, { status: 'unhealthy' }),
  },
};

export const Mixed = {
  args: {
    sbdDevices: [
      sbdDevicesFactory.build({ status: 'healthy' }),
      sbdDevicesFactory.build({ status: 'unhealthy' }),
    ],
  },
};

export const Empty = {
  args: {
    sbdDevices: [],
  },
};
