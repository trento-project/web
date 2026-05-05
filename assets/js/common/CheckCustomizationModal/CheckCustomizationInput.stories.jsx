import Component from './CheckCustomizationInput';
import { action } from 'storybook/actions';

export default {
  title: 'Components/CheckCustomizationInput',
  component: Component,
  argTypes: {
    name: {
      description: 'Name or label for the component',
      control: { type: 'text' },
    },
    defaultCheckValue: {
      description: 'The defaultCheckValue prop',
      control: { type: 'text' },
    },
    currentValue: {
      description: 'The currentValue prop',
      control: { type: 'text' },
    },
    inputIsLocked: {
      description: 'The inputIsLocked prop',
      control: { type: 'text' },
    },
    inputType: {
      description: 'The inputType prop',
      control: { type: 'text' },
    },
    handleInput: {
      description: 'Callback function invoked when input',
      action: 'handleInput',
    },
  },
};

export const Default = {
  args: {
    name: '',
    defaultCheckValue: '',
    currentValue: '',
    inputIsLocked: '',
    inputType: '',
    handleInput: action('handleInput'),
  },
};
