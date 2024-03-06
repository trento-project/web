import { sbdDevicesFactory } from '@lib/test-utils/factories';

import SBDDetails from './SBDDetails';

const healthyDevice = sbdDevicesFactory.build({ status: 'healthy' });
const unhealthyDevice = sbdDevicesFactory.build({ status: 'unhealthy' });

export default {
  title: 'Components/SBDDetails',
  component: SBDDetails,
  argTypes: {
    sbdDevices: {
      description: 'Array of SBD device objects',
      control: 'object',
    },
  },
};
export const EmptyState = {
  args: {
    sbdDevices: [],
  },
};

export const HealthyDevice = {
  args: {
    sbdDevices: [healthyDevice],
  },
};

export const UnhealthyDevice = {
  args: {
    sbdDevices: [unhealthyDevice],
  },
};

export const MultipleDevices = {
  args: {
    sbdDevices: [healthyDevice, unhealthyDevice],
  },
};
