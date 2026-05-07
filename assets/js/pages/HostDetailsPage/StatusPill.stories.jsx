// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import StatusPill from './StatusPill';

export default {
  title: 'Components/StatusPill',
  component: StatusPill,
  argTypes: {
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
    heartbeat: {
      description: 'The heartbeat status',
      control: { type: 'select' },
      options: ['passing', 'critical'],
    },
  },
};

export const Default = {
  args: {
    className: '',
    children: 'Agent',
    heartbeat: 'passing',
  },
};

export const Critical = {
  args: {
    ...Default.args,
    heartbeat: 'critical',
  },
};
