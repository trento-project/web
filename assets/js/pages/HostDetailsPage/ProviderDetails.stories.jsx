import HostDetailsPage from '.';
import { providers } from '@lib/model';

export default {
  title: 'Components/ProviderDetails',
  component: HostDetailsPage,
  argTypes: {
    provider: {
      description: 'Cloud provider',
      control: { type: 'select' },
      options: [...providers, 'unrecognized-provider'],
    },
    provider_data: {
      description: 'Identifier for the provider_data',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    provider: 'aws',
    provider_data: {
      instance_type: 't3.large',
      instance_id: 'i-1234567890abcdef0',
      region: 'us-east-1',
      availability_zone: 'us-east-1a',
    },
  },
};
