import React from 'react';
import { screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';
import { clusterFactory, hostFactory } from '@lib/test-utils/factories';

import '@testing-library/jest-dom';
import ExecutionHeader from './ExecutionHeader';

describe('Checks results ExecutionHeader Component', () => {
  describe('With target Cluster', () => {
    it('should render a header with expected cluster information', () => {
      const clusterID = faker.string.uuid();
      const clusterName = faker.animal.bear();
      const cloudProvider = 'azure';
      const clusterScenario = 'hana_scale_up';

      const target = clusterFactory.build({
        id: clusterID,
        name: clusterName,
        provider: cloudProvider,
        type: clusterScenario,
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
      expect(screen.getByText('HANA scale-up')).toBeTruthy();
      expect(screen.getByText('Checks Results for cluster')).toBeTruthy();
      expect(screen.getByText(clusterName)).toBeTruthy();
    });

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
      expect(screen.getByText('HANA scale-up')).toBeTruthy();
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

      const target = hostFactory.build({
        id: hostID,
        name: hostName,
        provider: cloudProvider,
        agent_version: agentVersion,
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
