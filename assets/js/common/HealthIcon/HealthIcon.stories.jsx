// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import HealthIcon from './HealthIcon';

export default {
  title: 'Components/HealthIcon',
  component: HealthIcon,
  argTypes: {
    isLink: {
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
    },
  },
};

export const Default = {
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
};
