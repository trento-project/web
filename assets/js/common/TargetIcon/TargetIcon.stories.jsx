import React from 'react';
import TargetIcon from './TargetIcon';

export default {
  title: 'Components/TargetIcon',
  component: TargetIcon,
  argTypes: {
    targetType: {
      description: 'Type of the target',
      control: { type: 'select', options: ['host', 'cluster'] },
    },
    containerClassName: {
      description: 'Custom CSS class for the container',
      control: { type: 'text' },
    },
    className: {
      description: 'Custom CSS class for the icon',
      control: { type: 'text' },
    },
    children: {
      description: 'Optional label to display next to the icon',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    targetType: 'host',
    containerClassName: '',
    className: '',
    children: '',
  },
};

export const Host = {
  args: {
    ...Default.args,
    targetType: 'host',
  },
};

export const Cluster = {
  args: {
    ...Default.args,
    targetType: 'cluster',
  },
};

export const WithCustomStyles = {
  args: {
    ...Default.args,
    targetType: 'host',
    containerClassName:
      'inline-flex bg-jungle-green-500 p-1 rounded-full self-center',
    className: 'fill-white',
  },
};

export const WithLabel = {
  args: {
    ...Default.args,
    targetType: 'host',
    className: 'inline mr-2 h-4',
  },
  render: (args) => <TargetIcon {...args}>Hosts</TargetIcon>,
};
