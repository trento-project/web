import React from 'react';
import { MemoryRouter } from 'react-router';
import Component from './ClusterNodeName';

export default {
  title: 'Components/ClusterNodeName',
  component: Component,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    status: {
      description: 'Node health status',
      control: { type: 'select' },
      options: ['online', 'offline', 'standby'],
    },
    hostId: {
      description: 'Unique identifier for the host',
      control: { type: 'text' },
    },
    resources: {
      description: 'Resources managed by this node',
      control: { type: 'object' },
    },
    children: {
      description: 'Node name or label',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    status: 'online',
    hostId: 'host_001',
    resources: [{ id: 'res_001', name: 'Resource 1' }],
    children: 'node-01',
  },
};

export const Offline = {
  args: {
    ...Default.args,
    status: 'offline',
    hostId: 'host_002',
    resources: [],
    children: 'node-02',
  },
};

export const Standby = {
  args: {
    ...Default.args,
    status: 'standby',
    hostId: 'host_003',
    resources: [{ id: 'res_002', name: 'Resource 2' }],
    children: 'node-03',
  },
};
