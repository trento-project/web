import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClusterInfoBox } from './ClusterInfoBox';

describe('Cluster Info Box', () => {
  [
    {
      haScenario: 'hana_scale_up',
      haScenarioText: 'HANA scale-up',
      provider: 'aws',
      providerText: 'AWS',
    },
    {
      haScenario: 'hana_scale_out',
      haScenarioText: 'HANA scale-out',
      provider: 'aws',
      providerText: 'AWS',
    },
    {
      haScenario: 'hana_scale_up',
      haScenarioText: 'HANA scale-up',
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
      providerText: 'KVM',
    },
    {
      haScenario: 'unknown',
      haScenarioText: 'Unknown',
      provider: 'vmware',
      providerText: 'Vmware',
    },
    {
      haScenario: 'hana_scale_up',
      haScenarioText: 'HANA scale-up',
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
