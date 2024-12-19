import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { renderWithRouter } from '@lib/test-utils';

import ClusterInfoBox from './ClusterInfoBox';

describe('Cluster Info Box', () => {
  [
    {
      clusterType: 'hana_scale_up',
      haScenarioText: 'HANA Scale Up Perf. Opt.',
      scaleUpScenario: 'performance_optimized',
      provider: 'aws',
      providerText: 'AWS',
    },
    {
      clusterType: 'hana_scale_up',
      haScenarioText: 'HANA Scale Up Cost Opt.',
      scaleUpScenario: 'cost_optimized',
      provider: 'aws',
      providerText: 'AWS',
    },
    {
      clusterType: 'hana_scale_out',
      haScenarioText: 'HANA Scale Out',
      scaleUpScenario: '',
      provider: 'aws',
      providerText: 'AWS',
    },
    {
      clusterType: 'hana_scale_up',
      haScenarioText: 'HANA Scale Up',
      scaleUpScenario: '',
      provider: 'azure',
      providerText: 'Azure',
    },
    {
      clusterType: 'hana_scale_up',
      haScenarioText: 'HANA Scale Up Perf. Opt.',
      scaleUpScenario: 'performance_optimized',
      provider: 'azure',
      providerText: 'Azure',
    },
    {
      clusterType: 'hana_scale_up',
      haScenarioText: 'HANA Scale Up Cost Opt.',
      scaleUpScenario: 'cost_optimized',
      provider: 'azure',
      providerText: 'Azure',
    },
    {
      clusterType: 'ascs_ers',
      haScenarioText: 'ASCS/ERS',
      scaleUpScenario: '',
      provider: 'azure',
      providerText: 'Azure',
    },
    {
      clusterType: '',
      haScenarioText: 'Unknown',
      scaleUpScenario: '',
      provider: 'gcp',
      providerText: 'GCP',
    },
    {
      clusterType: 'unknown',
      haScenarioText: 'Unknown',
      scaleUpScenario: '',
      provider: 'kvm',
      providerText: 'On-premises / KVM',
    },
    {
      clusterType: 'unknown',
      haScenarioText: 'Unknown',
      scaleUpScenario: '',
      provider: 'vmware',
      providerText: 'VMware',
    },
    {
      clusterType: 'hana_scale_up',
      haScenarioText: 'HANA Scale Up Perf. Opt.',
      scaleUpScenario: 'performance_optimized',
      provider: 'nutanix',
      providerText: 'Nutanix',
    },
    {
      clusterType: 'hana_scale_up',
      haScenarioText: 'HANA Scale Up Cost Opt.',
      scaleUpScenario: 'cost_optimized',
      provider: 'nutanix',
      providerText: 'Nutanix',
    },
  ].forEach(
    ({
      clusterType,
      scaleUpScenario,
      haScenarioText,
      provider,
      providerText,
    }) => {
      it(`should display ${providerText} as the provider and HA Scenario: ${haScenarioText}`, () => {
        const { getByText } = render(
          <ClusterInfoBox
            clusterType={clusterType}
            scaleUpScenario={scaleUpScenario}
            provider={provider}
          />
        );
        expect(getByText(providerText)).toBeTruthy();
        expect(getByText(haScenarioText)).toBeTruthy();
      });
    }
  );

  it.each([
    { architectureType: 'classic', tooltip: 'Classic architecture' },
    { architectureType: 'angi', tooltip: 'Angi architecture' },
  ])(
    'should display architecture type icon',
    async ({ architectureType, tooltip }) => {
      const user = userEvent.setup();

      renderWithRouter(
        <ClusterInfoBox
          clusterType="hana_scale_up"
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
    render(<ClusterInfoBox clusterType="ascs_ers" provider="azure" />);
    expect(screen.queryByTestId('eos-svg-component')).not.toBeInTheDocument();
  });
});
