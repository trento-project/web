// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { action } from 'storybook/actions';

import Checkbox from './Checkbox';

export default {
  title: 'Components/Input/Checkbox',
  component: Checkbox,
  argTypes: {
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    checked: {
      description: 'Whether the checkbox is checked',
      control: { type: 'boolean' },
    },
    indeterminate: {
      description:
        'Whether the checkbox is in indeterminate state. It takes precedence over checked visually',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Whether the component is disabled',
      control: { type: 'boolean' },
    },
    onChange: {
      description: 'Callback function invoked when the checkbox is clicked',
      action: 'onChange',
    },
  },
};

export const Default = {
  args: {
    className: '',
    checked: false,
    indeterminate: false,
    disabled: false,
    onChange: action('onChange'),
  },
};

export const Checked = {
  args: {
    ...Default.args,
    checked: true,
  },
};

export const Indeterminate = {
  args: {
    ...Default.args,
    indeterminate: true,
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const DisabledChecked = {
  args: {
    ...Checked.args,
    disabled: true,
  },
};

export const WithControlledValue = {
  args: {
    ...Default.args,
  },
  render: (args) => {
    const [checked, setChecked] = useState(false);

    return (
      <Checkbox
        {...args}
        checked={checked}
        onChange={() => setChecked((prev) => !prev)}
      />
    );
  },
};
