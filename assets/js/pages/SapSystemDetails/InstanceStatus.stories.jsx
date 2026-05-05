import SapSystemDetails from '.';

export default {
  title: 'Components/InstanceStatus',
  component: SapSystemDetails,
  argTypes: {
    health: {
      description: 'The health prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    health: '',
  },
};
