// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import ReplicationStatusPill from './ReplicationStatusPill';

export default {
  title: 'Components/ReplicationStatusPill',
  component: ReplicationStatusPill,
  argTypes: {
    status: {
      description: 'Replication status',
      control: { type: 'select' },
      options: ['Primary', 'Secondary', 'Unknown', 'Failed'],
    },
  },
};

export const Default = {
  args: {
    status: 'Primary',
  },
};

export const Secondary = {
  args: {
    ...Default.args,
    status: 'Secondary',
  },
};

export const Unknown = {
  args: {
    ...Default.args,
    status: 'Unknown',
  },
};

export const Failed = {
  args: {
    ...Default.args,
    status: 'Failed',
  },
};
