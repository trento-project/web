import React from 'react';
import CheckableWarningMessage from '.';

export default {
  title: 'Components/CheckableWarningMessage',
  component: CheckableWarningMessage,
  argTypes: {
    hideCheckbox: {
      description: 'Hides the checkbox when set to true',
      control: { type: 'boolean' },
    },
    checked: {
      description: 'Checkbox state',
      control: { type: 'boolean' },
    },
    onChecked: {
      description: 'Function to toggle the checkbox state',
      action: 'onChecked',
    },
    children: {
      description: 'Content displayed inside the warning message',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    hideCheckbox: false,
    checked: false,
    children:
      'Trento and SUSE are not responsible for cluster operation failure due to deviation from Best Practices.',
    onChecked: () => {},
  },
};

export const Checked = {
  args: {
    hideCheckbox: false,
    checked: true,
    children:
      'Trento and SUSE are not responsible for cluster operation failure due to deviation from Best Practices.',
    onChecked: () => {},
  },
};

export const WithoutCheckbox = {
  args: {
    hideCheckbox: true,
    checked: false,
    children:
      'Trento and SUSE are not responsible for cluster operation failure due to deviation from Best Practices.',
    onChecked: () => {},
  },
};
