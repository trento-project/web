import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import {
  clusterFactory,
  hostFactory,
  hanaClusterDetailsNodesFactory,
  checksExecutionCompletedFactory,
  checksExecutionRunningFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';
import { faker } from '@faker-js/faker';
import HanaClusterDetails from './HanaClusterDetails';

describe('HanaClusterDetails component', () => {
  const executionId = faker.datatype.uuid();
  const scenarios = [
    {
      name: 'Execution is being loaded from wanda',
      selectedChecks: ['some'],
      hasSelectedChecks: true,
      lastExecution: { data: null, loading: true, error: null },
    },
    {
      name: 'No checks were selected',
      selectedChecks: [],
      hasSelectedChecks: false,
      lastExecution: {
        data: checksExecutionCompletedFactory.build({
          execution_id: executionId,
        }),
        loading: false,
        error: null,
      },
    },
    {
      name: 'Execution is still running',
      selectedChecks: ['A123'],
      hasSelectedChecks: true,
      lastExecution: {
        data: checksExecutionRunningFactory.build({
          execution_id: executionId,
        }),
        loading: false,
        error: null,
      },
    },
    {
      name: 'Execution has been requested',
      selectedChecks: ['A123'],
      hasSelectedChecks: true,
      lastExecution: {
        data: {
          execution_id: executionId,
          status: 'requested',
        },
        loading: false,
        error: null,
      },
    },
  ];

  it.each(scenarios)(
    'should disable starting a new execution when $name',
    ({ selectedChecks, hasSelectedChecks, lastExecution }) => {
      const hanaCluster = clusterFactory.build({
        type: 'hana_scale_out',
      });

      const {
        clusterID,
        clusterName,
        cib_last_written: cibLastWritten,
        type: clusterType,
        sid,
        provider,
        details,
      } = hanaCluster;

      const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

      const sapSystems = sapSystemFactory.buildList(2, { tenant: sid });

      renderWithRouter(
        <HanaClusterDetails
          clusterID={clusterID}
          clusterName={clusterName}
          selectedChecks={selectedChecks}
          hasSelectedChecks={hasSelectedChecks}
          hosts={hosts}
          clusterType={clusterType}
          cibLastWritten={cibLastWritten}
          sid={sid}
          provider={provider}
          sapSystems={sapSystems}
          details={details}
          lastExecution={lastExecution}
        />
      );

      expect(
        screen.getByText(`Start Execution`).closest('button')
      ).toBeDisabled();
    }
  );

  it('should show correctly the SID and a link to the SAP system', () => {
    const {
      clusterID,
      clusterName,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sid,
      provider,
      details,
    } = clusterFactory.build();

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    const sapSystems = sapSystemFactory.buildList(2, { tenant: sid });

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        clusterName={clusterName}
        selectedChecks={[]}
        hasSelectedChecks={false}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        sid={sid}
        provider={provider}
        sapSystems={sapSystems}
        details={details}
        lastExecution={null}
      />
    );

    const sidContainer = screen.getByText('SID').nextSibling;

    expect(sidContainer).toHaveTextContent(sid);
    expect(sidContainer.querySelector('a')).toHaveAttribute(
      'href',
      `/databases/${sapSystems[0].id}`
    );
  });

  it('should show the SID even if the sap systems enriched data is not available', () => {
    const {
      clusterID,
      clusterName,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sid,
      provider,
      details,
    } = clusterFactory.build();

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        clusterName={clusterName}
        selectedChecks={[]}
        hasSelectedChecks={false}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        sid={sid}
        provider={provider}
        sapSystems={[]}
        details={details}
        lastExecution={null}
      />
    );

    const sidContainer = screen.getByText('SID').nextSibling;

    expect(sidContainer).toHaveTextContent(sid);
    expect(sidContainer.querySelector('a')).toBeNull();
  });

  it('should display a host link in the site details if the host is registered', () => {
    const unregisteredClusterNode = hanaClusterDetailsNodesFactory.build({ name: "unknownhost" })
    const registeredClusterNode = hanaClusterDetailsNodesFactory.build({ name: "registeredhost" })


    const {
      clusterID,
      clusterName,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sid,
      provider,
      details,
    } = clusterFactory.build({ nodes: [unregisteredClusterNode, registeredClusterNode] });

    const hosts = hostFactory.buildList(2, { hostname: "registeredhost", cluster_id: clusterID });

    const sapSystems = sapSystemFactory.buildList(2, { tenant: sid });

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        clusterName={clusterName}
        selectedChecks={[]}
        hasSelectedChecks={false}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        sid={sid}
        provider={provider}
        sapSystems={sapSystems}
        details={details}
        lastExecution={null}
      />
    );

    const unregisteredHostContainer = screen.getByText('unknownhost').nextSibling;
    const registeredHostContainer = screen.getByText('registeredhost');

    expect(registeredHostContainer).toBeInTheDocument();
    expect(unregisteredHostContainer.querySelector('a')).toHaveAttribute(
      'href',
      `/hosts/registeredhost}`
    );
  });
});
