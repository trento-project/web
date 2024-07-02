import CleanUpButton from '.';

export default {
  title: 'Components/CleanUpButton',
  component: CleanUpButton,
  argTypes: {
    cleaning: {
      control: { type: 'boolean' },
      description: 'Cleaning state',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: false },
      },
    },
    userAbilities: {
      control: 'array',
      description: 'Current user abilities',
    },
    permittedFor: {
      control: 'array',
      description: 'Abilities that allow check selection',
    },
    onClick: { action: 'Click button' },
    className: {
      control: 'text',
      description: 'CSS classes',
      table: {
        type: { summary: 'string' },
      },
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'fit'],
      description: 'Button size',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'small' },
      },
    },
    type: {
      control: { type: 'radio' },
      options: ['primary-white', 'transparent'],
      description: 'Style type',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary-white' },
      },
    },
  },
};

export const Default = {
  args: {
    userAbilities: [{ name: 'all', resource: 'all' }],
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
