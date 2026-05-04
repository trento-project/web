import Component from './TargetInfoBox';

export default {
  title: 'Components/TargetInfoBox',
  component: Component,
  argTypes: {
    targetType: {
      description: 'Type of target (host or cluster)',
      control: { type: 'select' },
      options: ['host', 'cluster'],
    },
    target: {
      description: 'Target object with id, name, and other properties',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    targetType: 'host',
    target: { id: 'host_001', name: 'server-01' },
  },
};

export const Cluster = {
  args: {
    targetType: 'cluster',
    target: { id: 'cluster_001', name: 'HANA-Cluster' },
  },
};
