import { Password } from '.';
import { action } from 'storybook/actions';

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
      type: 'string',
      description:
        'Additional CSS classes to apply to the password input wrapper',
      control: { type: 'text' },
    },
    id: {
      type: 'string',
      description: 'The id attribute of the underlying input element',
      control: { type: 'text' },
    },
    name: {
      type: 'string',
      description: 'The name attribute of the underlying input element',
      control: { type: 'text' },
    },
    value: {
      type: 'string',
      description: 'The controlled value of the password input',
      control: { type: 'text' },
    },
    initialValue: {
      type: 'string',
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
    error: '',
    disabled: false,
    className: '',
    id: '',
    name: '',
    value: '',
    initialValue: '',
    type: '',
    prefix: '',
    suffix: '',
    allowClear: '',
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
