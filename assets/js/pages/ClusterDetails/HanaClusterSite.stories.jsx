import Component from './HanaClusterSite';

export default {
  title: 'Components/HanaClusterSite',
  component: Component,
  argTypes: {
    name: {
      description: 'Name or label for the component',
      control: { type: 'text' },
    },
    nodes: {
      description: 'The nodes prop',
      control: { type: 'object' },
    },
    state: {
      description: 'The state prop',
      control: { type: 'text' },
    },
    srHealthState: {
      description: 'The srHealthState prop',
      control: { type: 'text' },
    },
    userAbilities: {
      description: 'The userAbilities prop',
      control: { type: 'object' },
    },
    getClusterHostOperations: {
      description: 'The getClusterHostOperations prop',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    name: '',
    nodes: '',
    state: '',
    srHealthState: '',
    userAbilities: '',
    getClusterHostOperations: '',
  },
};
