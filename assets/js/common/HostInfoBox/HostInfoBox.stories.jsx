import HostInfoBox from '.';
import { architectures, providers } from '@lib/model';
import { hostFactory } from '@lib/test-utils/factories';

const host = hostFactory.build();

export default {
  title: 'Components/HostInfoBox',
  component: HostInfoBox,
  argTypes: {
    arch: {
      description: 'The arch prop',
      control: { type: 'select' },
      options: architectures,
    },
    provider: {
      description: 'Cloud provider',
      control: { type: 'select' },
      options: [...providers, 'unrecognized-provider'],
    },
    agentVersion: {
      description: 'The agentVersion prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    arch: host.arch,
    provider: host.provider,
    agentVersion: host.agent_version,
  },
};
