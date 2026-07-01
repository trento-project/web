// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from 'react';

import HealthIcon from './HealthIcon';
=======
import HealthIcon from '.';
>>>>>>> main

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
<<<<<<< HEAD
      control: { type: 'boolean' },
    },
    health: {
      description: 'The health status to display',
      control: { type: 'select' },
      options: [
        'passing',
        'warning',
        'critical',
        'absent',
        'pending',
        'unknown',
      ],
    },
    centered: {
      description: 'Whether to apply centering styles to the health icon',
      control: { type: 'boolean' },
    },
    hoverOpacity: {
      description: 'Whether to apply opacity change on hover',
      control: { type: 'boolean' },
    },
    size: {
      description: 'The icon size',
      control: { type: 'select' },
      options: ['xs', 's', 'm', 'l', 'xl'],
=======
      description: 'Whether to icon is a link or not',
      control: { type: 'boolean' },
>>>>>>> main
    },
  },
};

export const Default = {
<<<<<<< HEAD
  args: {
    health: 'unknown',
    isLink: false,
    centered: false,
    hoverOpacity: false,
    size: 'm',
  },
};

export const Passing = {
  args: {
    ...Default.args,
    health: 'passing',
    isLink: false,
  },
};

export const Warning = {
  args: {
    ...Default.args,
    health: 'warning',
    isLink: false,
  },
};

export const Critical = {
  args: {
    ...Default.args,
    health: 'critical',
    isLink: false,
  },
};

export const Pending = {
  args: {
    ...Default.args,
    health: 'pending',
    isLink: false,
  },
};

export const Absent = {
  args: {
    ...Default.args,
    health: 'absent',
    isLink: false,
  },
};

export const Linked = {
  args: {
    ...Default.args,
    isLink: true,
  },
};

export const ExtraLarge = {
  args: {
    ...Default.args,
    health: 'passing',
    size: 'xl',
    isLink: false,
  },
=======
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
>>>>>>> main
};
