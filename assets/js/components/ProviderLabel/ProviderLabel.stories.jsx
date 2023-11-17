import ProviderLabel from '.';

export default {
  title: 'Components/ProviderLabel',
  components: ProviderLabel,
};

export const Azure = {
  args: {
    provider: 'azure',
  },
};

export const AWS = {
  args: {
    provider: 'aws',
  },
};

export const GCP = {
  args: {
    provider: 'gcp',
  },
};

export const Nutanix = {
  args: {
    provider: 'nutanix',
  },
};

export const KVM = {
  args: {
    provider: 'kvm',
  },
};

export const VMWare = {
  args: {
    provider: 'vmware',
  },
};

export const Unknown = {
  args: {
    provider: 'unknown',
  },
};
