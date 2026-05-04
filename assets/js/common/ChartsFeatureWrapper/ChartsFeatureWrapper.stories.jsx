import Component from './ChartsFeatureWrapper';

export default {
  title: 'Components/ChartsFeatureWrapper',
  component: Component,
  argTypes: {
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
    chartsEnabled: {
      description: 'The chartsEnabled prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { chartsEnabled: '' },
};
