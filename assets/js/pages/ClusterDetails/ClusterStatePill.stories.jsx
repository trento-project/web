import Component from './ClusterStatePill';

export default {
  title: 'Components/ClusterStatePill',
  component: Component,
  argTypes: {
    state: {
      description: 'The state prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { state: '' },
};
