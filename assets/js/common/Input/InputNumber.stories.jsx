import Input from '.';
import { action } from 'storybook/actions';

export default {
  title: 'Components/Input/InputNumber',
  component: Input,
  argTypes: {
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    id: {
      description: 'Identifier for the id',
      control: { type: 'text' },
    },
    name: {
      description: 'The name prop',
      control: { type: 'text' },
    },
    value: {
      description: 'The value prop',
      control: { type: 'number' },
    },
    initialValue: {
      description: 'The initialValue prop',
      control: { type: 'number' },
    },
    placeholder: {
      description: 'Placeholder text shown when empty',
      control: { type: 'text' },
    },
    error: {
      description: 'The error prop',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Whether the component is disabled',
      control: { type: 'boolean' },
    },
    onChange: {
      description: 'Callback function invoked when change',
      action: 'onChange',
    },
  },
};

export const Default = {
  args: {
    className: '',
    id: 'number-input-1',
    name: 'number-input',
    placeholder: 'Enter number...',
    value: 0,
    initialValue: 0,
    disabled: false,
    error: false,
    onChange: action('onChange'),
  },
};
