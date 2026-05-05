import ClusterDetails from '.';

export default {
  title: 'Components/ClusterNodeLink',
  component: ClusterDetails,
  argTypes: {
    hostId: {
      description: 'Unique identifier for the host',
      control: { type: 'text' },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    hostId: '',
    children: 'Default children',
  },
};
