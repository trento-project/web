import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClusterInfoBox from './ClusterInfoBox';

describe('Cluster Info Box', () => {
  [
    {
      haScenario: 'hana_scale_up',
      haScenarioText: 'HANA Scale Up',
      provider: 'aws',
      providerText: 'AWS',
    },
    {
      haScenario: 'hana_scale_out',
      haScenarioText: 'HANA Scale Out',
      provider: 'aws',
      providerText: 'AWS',
    },
    {
      haScenario: 'hana_scale_up',
      haScenarioText: 'HANA Scale Up',
      provider: 'azure',
      providerText: 'Azure',
    },
    {
      haScenario: 'ascs_ers',
      haScenarioText: 'ASCS/ERS',
      provider: 'azure',
      providerText: 'Azure',
    },
    {
      haScenario: '',
      haScenarioText: 'Unknown',
      provider: 'gcp',
      providerText: 'GCP',
    },
    {
      haScenario: 'unknown',
      haScenarioText: 'Unknown',
      provider: 'kvm',
      providerText: 'on-premise / KVM',
    },
    {
      haScenario: 'unknown',
      haScenarioText: 'Unknown',
      provider: 'vmware',
      providerText: 'VMware',
    },
    {
      haScenario: 'hana_scale_up',
      haScenarioText: 'HANA Scale Up',
      provider: 'nutanix',
      providerText: 'Nutanix',
    },
  ].forEach(({ haScenario, haScenarioText, provider, providerText }) => {
    it(`should display ${providerText} as the provider and HA Scenario: ${haScenarioText}`, () => {
      const { getByText } = render(
        <ClusterInfoBox haScenario={haScenario} provider={provider} />
      );
      expect(getByText(providerText)).toBeTruthy();
      expect(getByText(haScenarioText)).toBeTruthy();
    });
  });
});
