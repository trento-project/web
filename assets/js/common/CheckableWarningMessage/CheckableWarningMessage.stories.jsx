import React from 'react';
import CheckableWarningMessage from '.';

export default {
  title: 'Components/CheckableWarningMessage',
  component: CheckableWarningMessage,
  argTypes: {
    hideCheckbox: {
      description: 'Hides the checkbox when set to true',
      control: 'boolean',
    },
    checked: {
      description: 'Checkbox state',
      control: 'boolean',
    },
    onChecked: {
      description: 'Function to toggle the checkbox state',
      action: 'onChecked',
    },
    children: {
      description: 'Content displayed inside the warning message',
      control: 'text',
    },
  },
  args: {
    hideCheckbox: false,
    checked: false,
    children:
      'Trento & SUSE cannot be held liable for damages if system is unable to function due to custom check value.',
  },
};

export function Default(args) {
  return <CheckableWarningMessage {...args} />;
}

export function Checked(args) {
  return <CheckableWarningMessage {...args} checked />;
}

export function WithoutCheckbox(args) {
  return <CheckableWarningMessage {...args} hideCheckbox />;
}
