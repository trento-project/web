import ReplicationStatusPill from './ReplicationStatusPill';

export default {
  title: 'Components/ReplicationStatusPill',
  component: ReplicationStatusPill,
  argTypes: {
    status: {
      description: 'Replication status',
      control: { type: 'select' },
      options: ['Primary', 'Secondary', 'Unknown', 'Disabled'],
    },
  },
};

export const Default = {
  args: {
    status: 'Primary',
  },
};

export const Secondary = {
  args: {
    ...Default.args,
    status: 'Secondary',
  },
};

export const Unknown = {
  args: {
    ...Default.args,
    status: 'Unknown',
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    status: 'Disabled',
  },
};
