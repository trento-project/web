import AvailableSoftwareUpdates from '.';

export default {
  title: 'Components/Loading',
  component: AvailableSoftwareUpdates,
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
