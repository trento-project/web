import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HostInfoBox from './HostInfoBox';

describe('Host Info Box', () => {
  const scenarios = [
    {
      agentVersion: '1.1.0+git.dev17.1660137228.fe5ba8a',
      provider: 'aws',
      providerText: 'AWS',
      arch: 'x86_64',
    },
    {
      agentVersion: '1.2.0+git.dev17.1660137228.fe5ba8a',
      provider: 'aws',
      providerText: 'AWS',
      arch: 'ppc64le',
    },
    {
      agentVersion: '2.0.0+git.dev17.1660137228.fe5ba8a',
      provider: 'azure',
      providerText: 'Azure',
      arch: 's390x',
    },
    {
      agentVersion: '1.1.0',
      provider: 'gcp',
      providerText: 'GCP',
      arch: 'unknown',
    },
    {
      agentVersion: '1.2.0',
      provider: 'kvm',
      providerText: 'On-premises / KVM',
      arch: 'x86_64',
    },
    {
      agentVersion: '2.0.0',
      provider: 'vmware',
      providerText: 'VMware',
      arch: 'x86_64',
    },
    {
      agentVersion: '2.1.0',
      provider: 'nutanix',
      providerText: 'Nutanix',
      arch: 'x86_64',
    },
  ];

  it.each(scenarios)(
    'should display host info box for $providerText',
    ({ agentVersion, provider, providerText, arch }) => {
      render(
        <HostInfoBox
          arch={arch}
          provider={provider}
          agentVersion={agentVersion}
        />
      );
      expect(screen.getByText(providerText)).toBeTruthy();
      expect(screen.getByText(agentVersion)).toBeTruthy();
      expect(screen.getByText(arch)).toBeTruthy();
    }
  );
});
