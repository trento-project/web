import Component from './ClusterLink';

export default {
  title: 'Components/ClusterLink',
  component: Component,
  argTypes: {
    cluster: {
      description: 'Cluster object with id and name',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    cluster: {
      id: 'cluster_001',
      name: 'HANA-Cluster',
    },
  },
};

export const AnotherCluster = {
  args: {
    cluster: {
      id: 'cluster_002',
      name: 'Corosync-Pacemaker',
    },
  },
};
