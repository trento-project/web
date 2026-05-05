import HealthIcon from '@common/HealthIcon';
import Tooltip from '@common/Tooltip';
import React from 'react';
import { action } from 'storybook/actions';

import Pill from './Pill';

export default {
  title: 'Components/Pill',
  component: Pill,
  argTypes: {
    size: {
      description: 'Size of the pill',
      options: ['xs', 'sm', 'md'],
      control: { type: 'select' },
    },
    disabled: {
      description: 'Whether the pill is disabled',
      control: { type: 'boolean' },
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
      options: ['rounded-full', 'rounded-lg', 'rounded'],
      control: {
        type: 'select',
      },
    },
    display: {
      description: 'CSS display property for the pill',
      options: ['inline-flex', 'inline-block', 'block'],
      control: {
        type: 'select',
      },
    },
  },
};

export const Default = {
  args: {
    size: 'md',
    disabled: false,
    className: '',
    children: 'Pill',
    onClick: action('onClick'),
    roundedMode: 'rounded-full',
    display: 'inline-flex',
  },
};

export const Small = {
  args: {
    ...Default.args,
    size: 'sm',
    children: 'Small!',
  },
};

export const ExtraSmall = {
  args: {
    ...Default.args,
    size: 'xs',
    children: 'Extra small!',
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    size: 'xs',
    disabled: true,
    children: 'Disabled',
  },
};

export const WithIcon = {
  args: {
    ...Default.args,
    className: 'bg-green-100 text-green-800 group flex items-center',
  },
  render: (args) => (
    <Pill {...args}>
      <HealthIcon size="base" health="passing" />
      <span className="ml-1">Nice!</span>
    </Pill>
  ),
};

export const Warning = {
  args: {
    ...Default.args,
    className: 'bg-yellow-200 text-yellow-600',
    children: 'Warning!',
  },
};

export const Critical = {
  args: {
    ...Default.args,
    className: 'bg-red-200 text-red-600',
    children: 'Critical!',
  },
};

export const Truncated = {
  args: {
    ...Default.args,
    display: 'inline-block',
    className: 'bg-green-100 text-green-800 truncate w-24',
    children: 'Truncated pill text',
  },
};

export const WithTooltip = {
  args: {
    ...Default.args,
    className: 'bg-green-100 text-green-800 relative',
  },
  render: (args) => (
    <Pill {...args}>
      <Tooltip content="Oh yeah!">With tooltip!</Tooltip>
    </Pill>
  ),
};
