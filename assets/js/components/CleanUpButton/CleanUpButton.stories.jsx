import CleanUpButton from '.';

export default {
  title: 'CleanUpButton',
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
  },
};

export const Default = {
  args: {},
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
    size: 'fit',
  },
};
