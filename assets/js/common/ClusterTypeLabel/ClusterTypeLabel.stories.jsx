import Component from './ClusterTypeLabel';

export default {
  title: 'Components/ClusterTypeLabel',
  component: Component,
  argTypes: {
    clusterType: {
      description: 'Type of the cluster',
      control: { type: 'text' },
    },
    clusterScenario: {
      description: 'Cluster deployment scenario',
      control: { type: 'text' },
    },
    architectureType: {
      description: 'Type of cluster architecture',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { clusterType: '', clusterScenario: '', architectureType: '' },
};
