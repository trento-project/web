import React from 'react';
import { screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';
import { clusterFactory, hostFactory } from '@lib/test-utils/factories';

import '@testing-library/jest-dom';
import ExecutionHeader from './ExecutionHeader';

describe('Checks results ExecutionHeader Component', () => {
  describe('With target Cluster', () => {
    it.each([
      {
        hanaScenario: 'performance_optimized',
        hanaScenarioLabel: 'HANA Scale Up Perf. Opt.',
      },
      {
        hanaScenario: 'cost_optimized',
        hanaScenarioLabel: 'HANA Scale Up Cost Opt.',
      },
    ])(
      'should render a header with expected cluster information for correct scale up scenario',
      ({ hanaScenario, hanaScenarioLabel }) => {
        const clusterID = faker.string.uuid();
        const clusterName = faker.animal.bear();
        const cloudProvider = 'azure';
        const clusterScenario = 'hana_scale_up';

        const target = clusterFactory.build({
          id: clusterID,
          name: clusterName,
          provider: cloudProvider,
          type: clusterScenario,
          details: { hana_scenario: hanaScenario },
        });

        renderWithRouter(
          <ExecutionHeader
            targetID={clusterID}
            targetName={clusterName}
            targetType="cluster"
            target={target}
          />
        );

        expect(screen.getByText('Back to Cluster Details')).toBeTruthy();
        expect(screen.getByText('Azure')).toBeTruthy();
        expect(screen.getByText(hanaScenarioLabel)).toBeTruthy();
        expect(screen.getByText('Checks Results for cluster')).toBeTruthy();
        expect(screen.getByText(clusterName)).toBeTruthy();
        expect(screen.queryByText('Architecture')).not.toBeInTheDocument();
      }
    );

    it('should render a header with a warning banner on an unknown provider detection', () => {
      const clusterID = faker.string.uuid();
      const clusterName = faker.animal.bear();
      const cloudProvider = 'unknown';
      const clusterScenario = 'hana_scale_up';

      const target = clusterFactory.build({
        id: clusterID,
        name: clusterName,
        provider: cloudProvider,
        type: clusterScenario,
        details: { hana_scenario: 'performance_optimized' },
      });

      renderWithRouter(
        <ExecutionHeader
          targetID={clusterID}
          targetName={clusterName}
          targetType="cluster"
          target={target}
        />
      );

      expect(screen.getByText('Provider not recognized')).toBeTruthy();
      expect(screen.getByText('HANA Scale Up Perf. Opt.')).toBeTruthy();
      expect(screen.getByText('Checks Results for cluster')).toBeTruthy();
      expect(
        screen.getByText(
          /The following results are valid for on-premise bare metal platforms./
        )
      ).toBeTruthy();
    });
  });

  describe('With target Host', () => {
    it('should render a header with expected host information', () => {
      const hostID = faker.string.uuid();
      const hostName = faker.animal.bear();
      const cloudProvider = 'aws';
      const agentVersion = '2.1.1';
      const arch = 'x86_64';

      const target = hostFactory.build({
        id: hostID,
        name: hostName,
        provider: cloudProvider,
        agent_version: agentVersion,
        arch,
      });

      renderWithRouter(
        <ExecutionHeader
          targetID={hostID}
          targetName={hostName}
          targetType="host"
          target={target}
        />
      );

      expect(screen.getByText('Back to Host Details')).toBeTruthy();
      expect(screen.getByText('AWS')).toBeTruthy();
      expect(screen.getByText('Checks Results for host')).toBeTruthy();
      expect(screen.getByText(hostName)).toBeTruthy();
      expect(screen.getByText('Agent version')).toBeTruthy();
      expect(screen.getByText(agentVersion)).toBeTruthy();
      expect(screen.getByText('Architecture')).toBeTruthy();
      expect(screen.getByText(arch)).toBeTruthy();
    });

    it('should not render a warning banner within the header on an unknown provider detection', () => {
      const hostID = faker.string.uuid();
      const hostName = faker.animal.bear();
      const cloudProvider = 'unknown';

      const target = hostFactory.build({
        id: hostID,
        name: hostName,
        provider: cloudProvider,
      });

      renderWithRouter(
        <ExecutionHeader
          targetID={hostID}
          targetName={hostName}
          targetType="host"
          target={target}
        />
      );

      expect(screen.getByText('Provider not recognized')).toBeTruthy();
      expect(
        screen.queryByText(/The following results are valid/)
      ).not.toBeTruthy();
    });
  });
});
