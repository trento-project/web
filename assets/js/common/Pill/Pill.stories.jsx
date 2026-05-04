import React from 'react';
import HealthIcon from '@common/HealthIcon';
import Tooltip from '@common/Tooltip';

import Pill from '.';

export default {
  title: 'Components/Pill',
  component: Pill,
  argTypes: {
    size: {
      description: 'Size of the pill',
      control: { type: 'select', options: ['xs', 'sm', 'md'] },
      defaultValue: 'md',
    },
    disabled: {
      description: 'Whether the pill is disabled',
      control: { type: 'boolean' },
      defaultValue: false,
    },
    className: {
      description: 'Additional CSS classes for custom styling',
      control: { type: 'text' },
    },
    children: {
      description: 'Content to be displayed inside the pill',
      control: { type: 'text' },
    },
    onClick: {
      description: 'Click handler function for the pill',
      action: 'onClick',
    },
    roundedMode: {
      description: 'Border radius style for the pill',
      control: {
        type: 'select',
        options: ['rounded-full', 'rounded-lg', 'rounded'],
      },
      defaultValue: 'rounded-full',
    },
    display: {
      description: 'CSS display property for the pill',
      control: {
        type: 'select',
        options: ['inline-flex', 'inline-block', 'block'],
      },
      defaultValue: 'inline-flex',
    },
  },
};

export const Default = {
  args: {
    size: 'md',
    disabled: false,
    className: '',
    children: 'Pill',
    onClick: () => {},
    roundedMode: 'rounded-full',
    display: 'inline-flex',
  },
};

export function Small() {
  return <Pill size="sm">Small!</Pill>;
}

export function ExtraSmall() {
  return <Pill size="xs">Extra small!</Pill>;
}

export function Disabled() {
  return (
    <Pill size="xs" disabled>
      {' '}
      Disabled
    </Pill>
  );
}

export function WithIcon() {
  return (
    <Pill className="bg-green-100 text-green-800 group flex items-center">
      <HealthIcon size="base" health="passing" />
      <span className="ml-1">Nice!</span>
    </Pill>
  );
}

export function Warning() {
  return <Pill className="bg-yellow-200 text-yellow-600">Warning!</Pill>;
}

export function Critical() {
  return <Pill className="bg-red-200 text-red-600">Critical!</Pill>;
}

export function Truncated() {
  return (
    <Pill
      display="inline-block"
      className="bg-green-100 text-green-800 truncate w-24"
    >
      Truncated pill text
    </Pill>
  );
}

export function WithTooltip() {
  return (
    <Pill className="bg-green-100 text-green-800 relative">
      <Tooltip content="Oh yeah!">With tooltip!</Tooltip>
    </Pill>
  );
}
