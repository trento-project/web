// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { MemoryRouter } from 'react-router';

import BackToTargetExecution from './BackToTargetExecution';

export default {
  title: 'Components/BackToTargetExecution',
  component: BackToTargetExecution,
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
      description: 'Type of the target',
      options: ['host', 'cluster'],
      control: { type: 'select' },
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
