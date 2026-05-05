import Component from './Features';

export default {
  title: 'Components/Features',
  component: Component,
  argTypes: {
    features: {
      description: 'The features prop',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: { features: '' },
};
