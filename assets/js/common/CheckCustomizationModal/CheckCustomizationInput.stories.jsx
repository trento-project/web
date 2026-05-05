import CheckCustomizationModal from '.';
import { action } from 'storybook/actions';

export default {
  title: 'Components/CheckCustomizationInput',
  component: CheckCustomizationModal,
  argTypes: {
    name: {
      description: 'Name or label for the component',
      control: { type: 'text' },
    },
    defaultCheckValue: {
      description: 'The defaultCheckValue prop',
      control: { type: 'boolean' },
    },
    currentValue: {
      description: 'The currentValue prop',
      control: { type: 'boolean' },
    },
    inputIsLocked: {
      description: 'The inputIsLocked prop',
      control: { type: 'boolean' },
    },
    inputType: {
      description: 'The inputType prop',
      options: ['boolean', 'string', 'number'],
      control: { type: 'select' },
    },
    handleInput: {
      description: 'Callback function invoked when input',
      action: 'handleInput',
    },
  },
};

export const Default = {
  args: {
    name: 'Enable Feature',
    defaultCheckValue: true,
    currentValue: true,
    inputIsLocked: false,
    inputType: 'boolean',
    handleInput: action('handleInput'),
  },
};
