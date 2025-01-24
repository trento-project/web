import React from 'react';
import HealthIcon from '.';

export default {
  title: 'Components/HealthIcon',
  component: HealthIcon,
  argTypes: {
    isLink: {
      control: 'boolean',
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
