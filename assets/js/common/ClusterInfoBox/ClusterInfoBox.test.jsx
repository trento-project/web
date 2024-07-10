import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { renderWithRouter } from '@lib/test-utils';

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
      providerText: 'On-premises / KVM',
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

  it.each([
    { architectureType: 'classic', tooltip: 'Classic architecture' },
    { architectureType: 'angi', tooltip: 'Angi architecture' },
  ])(
    'should display architecture type icon',
    async ({ architectureType, tooltip }) => {
      const user = userEvent.setup();

      renderWithRouter(
        <ClusterInfoBox
          haScenario="hana_scale_up"
          provider="azure"
          architectureType={architectureType}
        />
      );

      const icon = screen.getByTestId('eos-svg-component');

      await user.hover(icon);
      expect(screen.getByText(tooltip, { exact: false })).toBeInTheDocument();
    }
  );

  it('should not display architecture type icon if architecture is unknown', () => {
    render(<ClusterInfoBox haScenario="ascs_ers" provider="azure" />);
    expect(screen.queryByTestId('eos-svg-component')).not.toBeInTheDocument();
  });
});
