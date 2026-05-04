import Component from './ClusterInfoBox';

export default {
  title: 'Components/ClusterInfoBox',
  component: Component,
  argTypes: {
    clusterType: {
      description: 'Type of the cluster',
      control: { type: 'text' },
    },
    provider: {
      description: 'Identifier for the provider',
      control: { type: 'text' },
    },
    architectureType: {
      description: 'Type of cluster architecture',
      control: { type: 'text' },
    },
    scaleUpScenario: {
      description: 'The scaleUpScenario prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    clusterType: '',
    provider: '',
    architectureType: '',
    scaleUpScenario: '',
  },
};
