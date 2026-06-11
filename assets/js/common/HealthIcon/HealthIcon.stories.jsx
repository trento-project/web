// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import HealthIcon from '.';

export default {
  title: 'Components/HealthIcon',
  component: HealthIcon,
  argTypes: {
    health: {
      description: 'Type of health icon',
      control: { type: 'radio' },
      options: [
        'passing',
        'warning',
        'critical',
        'absent',
        'pending',
        'not_available',
        'unknown',
      ],
    },
    centered: {
      description: 'Whether to icon is centered or not',
      control: { type: 'boolean' },
    },
    hoverOpacity: {
      description: 'Whether to change opacity on hover or not',
      control: { type: 'boolean' },
    },
    size: {
      description: 'The size of the icon',
      control: { type: 'radio' },
      options: ['s', 'm', 'l', 'xl', 'xxl', 16, 24, 32, 48, 64],
      table: {
        type: { summary: 'string|number' },
        defaultValue: { summary: 'l' },
      },
    },
    isLink: {
      description: 'Whether to icon is a link or not',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: { health: 'unknown' },
};

export const Passing = {
  args: { health: 'passing' },
};

export const Warning = {
  args: { health: 'warning' },
};

export const Critical = {
  args: { health: 'critical' },
};

export const Pending = {
  args: { health: 'pending' },
};

export const Absent = {
  args: { health: 'absent' },
};

export const NotAvailable = {
  args: { health: 'not_available' },
};

export const ExtraLarge = {
  args: { health: 'passing', size: 'xl' },
};
