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
    },
    {
      agentVersion: '1.2.0+git.dev17.1660137228.fe5ba8a',
      provider: 'aws',
      providerText: 'AWS',
    },
    {
      agentVersion: '2.0.0+git.dev17.1660137228.fe5ba8a',
      provider: 'azure',
      providerText: 'Azure',
    },
    {
      agentVersion: '1.1.0',
      provider: 'gcp',
      providerText: 'GCP',
    },
    {
      agentVersion: '1.2.0',
      provider: 'kvm',
      providerText: 'on-premise / KVM',
    },
    {
      agentVersion: '2.0.0',
      provider: 'vmware',
      providerText: 'VMware',
    },
    {
      agentVersion: '2.1.0',
      provider: 'nutanix',
      providerText: 'Nutanix',
    },
  ];

  it.each(scenarios)(
    'should display host info box for $providerText',
    ({ agentVersion, provider, providerText }) => {
      render(<HostInfoBox provider={provider} agentVersion={agentVersion} />);
      expect(screen.getByText(providerText)).toBeTruthy();
      expect(screen.getByText(agentVersion)).toBeTruthy();
    }
  );
});
