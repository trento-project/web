import CleanUpButton from '.';

import { action } from 'storybook/actions';
export default {
  title: 'Components/CleanUpButton',
  component: CleanUpButton,
  argTypes: {
    cleaning: {
      control: { type: 'boolean' },
      description: 'Cleaning state',
    },
    userAbilities: {
      control: { type: 'object' },
      description: 'Current user abilities',
    },
    permittedFor: {
      control: { type: 'object' },
      description: 'Abilities that allow check selection',
    },
    onClick: { action: 'onClick' },
    className: {
      control: { type: 'text' },
      description: 'CSS classes',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'fit'],
      description: 'Button size',
    },
    type: {
      control: { type: 'radio' },
      options: ['primary-white', 'transparent'],
      description: 'Style type',
    },
  },
};

export const Default = {
  args: {
    userAbilities: [{ name: 'all', resource: 'all' }],
    permittedFor: [],
    onClick: action('onClick'),
    cleaning: false,
    className: '',
    size: 'small',
    type: 'primary-white',
  },
};

export const Cleaning = {
  args: {
    ...Default.args,
    cleaning: true,
  },
};

export const NoOutline = {
  args: {
    ...Default.args,
    className: 'border-none shadow-none',
  },
};

export const AbsentInstanceRow = {
  args: {
    ...Default.args,
    type: 'transparent',
    className: 'jungle-green-500 border-none shadown-none',
    size: 'fit',
  },
};

export const Unauthorized = {
  args: {
    ...Default.args,
    userAbilities: [],
  },
};
