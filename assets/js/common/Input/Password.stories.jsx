// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { action } from 'storybook/actions';

import Password from './Password';

export default {
  title: 'Components/Input/Password',
  component: Password,
  argTypes: {
    placeholder: {
      description: 'The placeholder text to render',
      control: { type: 'text' },
    },
    error: {
      description: 'Whether the field has an error',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Whether the input should be disabled or not',
      control: { type: 'boolean' },
    },
    className: {
      description:
        'Additional CSS classes to apply to the password input wrapper',
      control: { type: 'text' },
    },
    id: {
      description: 'The id attribute of the underlying input element',
      control: { type: 'text' },
    },
    name: {
      description: 'The name attribute of the underlying input element',
      control: { type: 'text' },
    },
    value: {
      description: 'The controlled value of the password input',
      control: { type: 'text' },
    },
    initialValue: {
      description:
        'The initial default value to populate the password input with on mount',
      control: { type: 'text' },
    },
    onChange: {
      description:
        'Callback function invoked when the password input value changes',
      action: 'onChange',
    },
  },
};

export const Default = {
  args: {
    placeholder: 'Password',
    error: false,
    disabled: false,
    className: '',
    id: 'password-1',
    name: 'password',
    value: '',
    initialValue: '',
    type: 'password',
    prefix: undefined,
    suffix: undefined,
    allowClear: false,
    onChange: action('onChange'),
  },
};

export const WithValue = {
  args: {
    ...Default.args,
    initialValue: 'somepassword',
  },
};

export const WithError = {
  args: {
    ...Default.args,
    initialValue: 'someotherpassword',
    error: true,
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const DisabledWithInitialValue = {
  args: {
    ...WithValue.args,
    ...Disabled.args,
  },
};
