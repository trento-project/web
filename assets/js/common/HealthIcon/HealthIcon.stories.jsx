import React from 'react';
import HealthIcon from '.';

export default {
  title: 'Components/HealthIcon',
  component: HealthIcon,
  argTypes: {
    isLink: {
      control: 'boolean',
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

export function Pending() {
  return <HealthIcon health="pending" />;
}

export const Absent = {
  args: { health: 'absent', isLink: false },
};

export function Default() {
  return <HealthIcon health="unknown" />;
}

export const ExtraLarge = {
  args: { health: 'passing', size: 'xl', isLink: false },
};
