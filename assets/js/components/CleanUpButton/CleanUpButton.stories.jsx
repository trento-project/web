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
