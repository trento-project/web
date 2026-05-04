import Component from './SaptuneServiceStatus';

export default {
  title: 'Components/SaptuneServiceStatus',
  component: Component,
  argTypes: {
    serviceName: {
      description: 'Name of the service',
      control: { type: 'text' },
    },
    enabled: {
      description: 'Whether the service is enabled',
      control: { type: 'boolean' },
    },
    active: {
      description: 'Whether the service is currently active',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: { serviceName: 'saptune', enabled: true, active: true },
};

export const Disabled = {
  args: { serviceName: 'sapconf', enabled: false, active: false },
};

export const EnabledNotActive = {
  args: { serviceName: 'tuned', enabled: true, active: false },
};

export const ActiveNotEnabled = {
  args: { serviceName: 'other-service', enabled: false, active: true },
};
