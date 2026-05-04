import Component from './InstanceStatus';

export default {
  title: 'Components/InstanceStatus',
  component: Component,
  argTypes: {
    health: {
      description: 'The health prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { health: '' },
};
