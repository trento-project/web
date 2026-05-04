import Component from './HostSummary';

export default {
  title: 'Components/HostSummary',
  component: Component,
  argTypes: {
    agentVersion: {
      description: 'The agentVersion prop',
      control: { type: 'text' },
    },
    arch: {
      description: 'The arch prop',
      control: { type: 'text' },
    },
    cluster: {
      description: 'The cluster prop',
      control: { type: 'text' },
    },
    ipAddresses: {
      description: 'Array of IP addresses',
      control: { type: 'object' },
    },
    lastBootTimestamp: {
      description: 'The lastBootTimestamp prop',
      control: { type: 'text' },
    },
    timezone: {
      description: 'The timezone prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    agentVersion: '0.0.1',
    arch: 'x86_64',
    cluster: 'HANA-Cluster',
    ipAddresses: ['192.168.1.100', '192.168.1.101'],
    lastBootTimestamp: '2024-01-01T00:00:00Z',
    timezone: 'UTC',
  },
};
