// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import DetailsViewHeader from './DetailsViewHeader';

export default {
  title: 'Components/DetailsViewHeader',
  component: DetailsViewHeader,
  argTypes: {
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    health: {
      description: 'Health icon type',
      control: { type: 'radio' },
      options: ['passing', 'warning', 'critical', 'unknown'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'passing' },
      },
    },
    staleAt: {
      description:
        'Timestamp when the resource became stale (null if not stale)',
      control: {
        type: 'text',
      },
    },
    timezone: {
      description: 'Timezone for displaying the stale timestamp',
      control: {
        type: 'text',
      },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    className: '',
    health: 'passing',
    children: 'Default children',
  },
};

export const Stale = {
  args: {
    className: '',
    health: 'passing',
    staleAt: '2026-06-15T10:30:00Z',
    children: 'Stale resource',
  },
};
