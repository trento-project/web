import Component from './Loading';

export default {
  title: 'Components/Loading',
  component: Component,
  argTypes: {
    className: {
      description: 'Additional CSS classes for the loading container.',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    className: '',
  },
};
