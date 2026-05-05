import HostDetailsPage from '.';

export default {
  title: 'Components/StatusPill',
  component: HostDetailsPage,
  argTypes: {
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
    heartbeat: {
      description: 'The heartbeat prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    className: '',
    children: 'Agent',
    heartbeat: 'passing',
  },
};
