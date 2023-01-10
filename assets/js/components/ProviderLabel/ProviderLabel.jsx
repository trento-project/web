import React from 'react';

import { EOS_HELP } from 'eos-icons-react';

import AwsLogo from '@static/aws-logo.svg';
import AzureLogo from '@static/azure-logo.svg';
import GcpLogo from '@static/gcp-logo.svg';
import NutanixLogo from '@static/nutanix-logo.svg';
import KvmLogo from '@static/suse-kvm-logo.svg';

const providerData = {
  aws: {
    logo: AwsLogo,
    label: 'AWS',
  },
  azure: {
    logo: AzureLogo,
    label: 'Azure',
  },
  gcp: {
    logo: GcpLogo,
    label: 'GCP',
  },
  nutanix: {
    logo: NutanixLogo,
    label: 'Nutanix',
  },
  kvm: {
    logo: KvmLogo,
    label: 'KVM',
  },
};

function ProviderLabel({ provider }) {
  return (
    <span>
      {providerData[provider] ? (
        <img
          src={providerData[provider].logo}
          className="inline mr-2 h-4"
          alt={provider}
        />
      ) : (
        <EOS_HELP className="inline mr-2" />
      )}
      {providerData[provider]
        ? providerData[provider].label
        : 'Provider not recognized'}
    </span>
  );
}

export default ProviderLabel;
