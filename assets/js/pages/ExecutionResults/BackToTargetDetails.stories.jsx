import React from 'react';
import { MemoryRouter } from 'react-router';

import BackToTargetDetails from './BackToTargetDetails';

export default {
  title: 'Components/BackToTargetDetails',
  component: BackToTargetDetails,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    targetType: {
      description: 'Type of target (host or cluster)',
      control: { type: 'select' },
      options: ['host', 'cluster'],
    },
    targetID: {
      description: 'Identifier for the target',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    targetType: 'host',
    targetID: 'host_001',
  },
};

export const Cluster = {
  args: {
    ...Default.args,
    targetType: 'cluster',
    targetID: 'cluster_001',
  },
};
