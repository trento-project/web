import React from 'react';

import { EOS_HELP } from 'eos-icons-react';

import AwsLogo from '@static/aws-logo.svg';
import AzureLogo from '@static/azure-logo.svg';
import GcpLogo from '@static/gcp-logo.svg';
import NutanixLogo from '@static/nutanix-logo.svg';
import KvmLogo from '@static/suse-kvm-logo.svg';
import VmwareLogo from '@static/vmware-logo.svg';
import {
  AWS_PROVIDER,
  AZURE_PROVIDER,
  GCP_PROVIDER,
  KVM_PROVIDER,
  NUTANIX_PROVIDER,
  VMWARE_PROVIDER,
} from '@lib/model';

export const providerData = {
  [AWS_PROVIDER]: {
    logo: AwsLogo,
    label: 'AWS',
  },
  [AZURE_PROVIDER]: {
    logo: AzureLogo,
    label: 'Azure',
  },
  [GCP_PROVIDER]: {
    logo: GcpLogo,
    label: 'GCP',
  },
  [NUTANIX_PROVIDER]: {
    logo: NutanixLogo,
    label: 'Nutanix',
  },
  [KVM_PROVIDER]: {
    logo: KvmLogo,
    label: 'On-premises / KVM',
  },
  [VMWARE_PROVIDER]: {
    logo: VmwareLogo,
    label: 'VMware',
  },
};

function ProviderLabel({ provider }) {
  return (
    <span className='flex items-center'>
      {providerData[provider] ? (
        <img
          src={providerData[provider].logo}
          className="mr-2 h-4"
          alt={provider}
        />
      ) : (
        <EOS_HELP className="mr-2" />
      )}
      {providerData[provider]
        ? providerData[provider].label
        : 'Provider not recognized'}
    </span>
  );
}

export default ProviderLabel;
