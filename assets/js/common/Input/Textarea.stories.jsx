import React, { useState } from 'react';
import { action } from 'storybook/actions';

import Textarea from './Textarea';

export default {
  title: 'Components/Input/Textarea',
  component: Textarea,
  argTypes: {
    id: {
      description: 'The id attribute of the textarea',
      control: { type: 'text' },
    },
    name: {
      description: 'The name attribute of the textarea',
      control: { type: 'text' },
    },
    value: {
      description: 'The value attribute of the textarea',
      control: { type: 'text' },
    },
    placeholder: {
      description: 'The placeholder text to render',
      control: { type: 'text' },
    },
    error: {
      description: 'Whether the field has an error',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Whether the textarea should be disabled or not',
      control: { type: 'boolean' },
    },
    className: {
      type: 'string',
      description: 'Additional CSS classes to apply to the textarea element',
      control: { type: 'text' },
    },
    initialValue: {
      type: 'string',
      description:
        'The initial value to populate the textarea with when the component mounts',
      control: { type: 'text' },
    },
    onChange: {
      description: 'Callback function invoked when the textarea value changes',
      action: 'onChange',
    },
  },
};

export const Default = {
  args: {
    id: '',
    name: '',
    value: '',
    placeholder: '',
    error: '',
    disabled: false,
    className: '',
    initialValue: '',
    onChange: action('onChange'),
  },
};

export const WithPlaceholder = {
  args: {
    placeholder: 'Placeholder text',
  },
};

export const Disabled = {
  args: {
    disabled: true,
  },
};

export const DisabledWithPlaceholder = {
  args: {
    ...WithPlaceholder.args,
    ...Disabled.args,
  },
};

export const WithInitialValue = {
  args: {
    initialValue: 'Initial value text',
  },
};

export const WithControlledValue = {
  args: {},
  render: () => {
    const [value, setValue] = useState('Value text');
    return (
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} />
    );
  },
};

export const WithError = {
  args: {
    value: 'This is a wrong value',
    error: true,
  },
};

export const DisabledWithValue = {
  args: {
    value: 'Value text',
    ...Disabled.args,
  },
};
