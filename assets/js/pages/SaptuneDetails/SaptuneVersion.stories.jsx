import Component from './SaptuneVersion';

export default {
  title: 'Components/SaptuneVersion',
  component: Component,
  argTypes: {
    sapPresent: {
      description: 'The sapPresent prop',
      control: { type: 'text' },
    },
    version: {
      description: 'The version prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { sapPresent: '', version: '' },
};
