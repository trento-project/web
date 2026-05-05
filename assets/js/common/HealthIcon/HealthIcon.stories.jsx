import React from 'react';
import HealthIcon from '.';

export default {
  title: 'Components/HealthIcon',
  component: HealthIcon,
  argTypes: {
    isLink: {
      control: { type: 'boolean' },
    },
    health: {
      type: 'string',
      description:
        'The health status to display (passing, warning, critical, absent, pending, or unknown)',
      control: { type: 'text' },
    },
    centered: {
      type: 'boolean',
      description: 'Whether to apply centering styles to the health icon',
      control: { type: 'boolean' },
    },
    hoverOpacity: {
      type: 'boolean',
      description: 'Whether to apply opacity change on hover',
      control: { type: 'boolean' },
    },
    size: {
      type: 'string',
      description: 'The icon size (xs, s, m, l, xl, or similar EOS icon size)',
      control: { type: 'text' },
    },
  },
};

export const Passing = {
  args: { health: 'passing', isLink: false },
};

export const Warning = {
  args: { health: 'warning', isLink: false },
};

export const Critical = {
  args: { health: 'critical', isLink: false },
};

export const Pending = {
  args: { health: 'pending', isLink: false },
};

export const Absent = {
  args: { health: 'absent', isLink: false },
};

export const Default = {
  args: { health: 'unknown', isLink: false },
};

export const ExtraLarge = {
  args: { health: 'passing', size: 'xl', isLink: false },
};
