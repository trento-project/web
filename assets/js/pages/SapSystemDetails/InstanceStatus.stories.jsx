// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import InstanceStatus from './InstanceStatus';

export default {
  title: 'Components/InstanceStatus',
  component: InstanceStatus,
  argTypes: {
    health: {
      description: 'The health status',
      control: { type: 'select' },
      options: ['passing', 'warning', 'critical'],
    },
  },
};

export const Default = {
  args: {
    health: 'passing',
  },
};

export const Warning = {
  args: {
    health: 'warning',
  },
};

export const Critical = {
  args: {
    health: 'critical',
  },
};
