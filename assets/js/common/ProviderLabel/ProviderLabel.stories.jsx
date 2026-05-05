import ProviderLabel from '.';
import { providers } from '@lib/model';

export default {
  title: 'Components/ProviderLabel',
  component: ProviderLabel,
  argTypes: {
    provider: {
      description: 'Cloud provider name',
      control: { type: 'select' },
      options: [...providers, 'unrecognized-provider'],
    },
  },
};

export const Default = {
  args: {
    provider: 'aws',
  },
};

export const Azure = {
  args: {
    ...Default.args,
    provider: 'azure',
  },
};

export const AWS = {
  args: {
    ...Default.args,
    provider: 'aws',
  },
};

export const GCP = {
  args: {
    ...Default.args,
    provider: 'gcp',
  },
};

export const Nutanix = {
  args: {
    ...Default.args,
    provider: 'nutanix',
  },
};

export const KVM = {
  args: {
    ...Default.args,
    provider: 'kvm',
  },
};

export const VMWare = {
  args: {
    ...Default.args,
    provider: 'vmware',
  },
};

export const Unknown = {
  args: {
    ...Default.args,
    provider: 'unrecognized-provider',
  },
};
