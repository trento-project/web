import Component from './ReplicationStatusPill';

export default {
  title: 'Components/ReplicationStatusPill',
  component: Component,
  argTypes: {
    status: {
      description: 'Replication status',
      control: { type: 'select' },
      options: ['Primary', 'Secondary', 'Unknown', 'Disabled'],
    },
  },
};

export const Default = {
  args: { status: 'Primary' },
};

export const Secondary = {
  args: { status: 'Secondary' },
};

export const Unknown = {
  args: { status: 'Unknown' },
};

export const Disabled = {
  args: { status: 'Disabled' },
};
