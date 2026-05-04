import React from 'react';
import { MemoryRouter } from 'react-router';
import Component from './BackToTargetExecution';

export default {
  title: 'Components/BackToTargetExecution',
  component: Component,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    targetID: {
      description: 'Identifier for the target',
      control: { type: 'text' },
    },
    targetType: {
      description: 'Type of target (host or cluster)',
      control: { type: 'select' },
      options: ['host', 'cluster'],
    },
  },
};

export const Default = {
  args: { targetID: 'host_001', targetType: 'host' },
};

export const Cluster = {
  args: { targetID: 'cluster_001', targetType: 'cluster' },
};
