import ChartsFeatureWrapper from '.';

export default {
  title: 'Components/ChartsFeatureWrapper',
  component: ChartsFeatureWrapper,
  argTypes: {
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
    chartsEnabled: {
      description: 'The chartsEnabled prop',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    chartsEnabled: false,
    children: 'Charts content goes here',
  },
};
