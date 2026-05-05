// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { action } from 'storybook/actions';

import CheckableWarningMessage from './CheckableWarningMessage';

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
    onChecked: action('onChecked'),
  },
};

export const Checked = {
  args: {
    ...Default.args,
    hideCheckbox: false,
    checked: true,
    children:
      'Trento and SUSE are not responsible for cluster operation failure due to deviation from Best Practices.',
    onChecked: action('onChecked'),
  },
};

export const WithoutCheckbox = {
  args: {
    ...Default.args,
    hideCheckbox: true,
    checked: false,
    children:
      'Trento and SUSE are not responsible for cluster operation failure due to deviation from Best Practices.',
    onChecked: action('onChecked'),
  },
};
