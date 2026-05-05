import React from 'react';
import { MemoryRouter } from 'react-router';
import CheckResultDetail from '.';

export default {
  title: 'Components/BackToTargetExecution',
  component: CheckResultDetail,
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
  args: {
    targetID: 'host_001',
    targetType: 'host',
  },
};

export const Cluster = {
  args: {
    ...Default.args,
    targetID: 'cluster_001',
    targetType: 'cluster',
  },
};
