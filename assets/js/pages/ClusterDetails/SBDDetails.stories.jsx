import Component from './SBDDetails';

export default {
  title: 'Components/SBDDetails',
  component: Component,
  argTypes: {
    sbdDevices: {
      description: 'The sbdDevices prop',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: { sbdDevices: '' },
};
