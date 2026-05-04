import Component from './DiskSpaceChart';

export default {
  title: 'Components/DiskSpaceChart',
  component: Component,
  argTypes: {
    hostId: {
      description: 'Unique identifier for the host',
      control: { type: 'text' },
    },
    updateFrequency: {
      description: 'The updateFrequency prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { hostId: '', updateFrequency: '' },
};
