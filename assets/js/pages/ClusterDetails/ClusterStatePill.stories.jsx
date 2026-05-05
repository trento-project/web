import ClusterDetails from '.';

export default {
  title: 'Components/ClusterStatePill',
  component: ClusterDetails,
  argTypes: {
    state: {
      description: 'The state prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    state: '',
  },
};
