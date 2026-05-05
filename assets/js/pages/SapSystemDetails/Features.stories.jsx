import SapSystemDetails from '.';

export default {
  title: 'Components/Features',
  component: SapSystemDetails,
  argTypes: {
    features: {
      description: 'The features prop',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    features: 'Example feature 1|Example feature 2|Example feature 3',
  },
};
