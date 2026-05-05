import InstanceStatus from './InstanceStatus';

export default {
  title: 'Components/InstanceStatus',
  component: InstanceStatus,
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
