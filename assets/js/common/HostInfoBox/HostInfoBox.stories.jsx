import Component from './HostInfoBox';

export default {
  title: 'Components/HostInfoBox',
  component: Component,
  argTypes: {
    arch: {
      description: 'The arch prop',
      control: { type: 'text' },
    },
    provider: {
      description: 'Identifier for the provider',
      control: { type: 'text' },
    },
    agentVersion: {
      description: 'The agentVersion prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { arch: '', provider: '', agentVersion: '' },
};
