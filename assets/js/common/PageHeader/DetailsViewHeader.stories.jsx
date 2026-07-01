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
