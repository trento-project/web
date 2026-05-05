import HostDetailsPage from '.';

export default {
  title: 'Components/DiskSpaceChart',
  component: HostDetailsPage,
  argTypes: {
    hostId: {
      description: 'Unique identifier for the host',
      control: { type: 'text' },
    },
    updateFrequency: {
      description: 'The updateFrequency prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    hostId: 'host-123',
    updateFrequency: 30000,
  },
};
