import React from 'react';

import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import {
  hostFactory,
  buildHostsFromAscsErsClusterDetails,
  buildSapSystemsFromAscsErsClusterDetails,
  ascsErsClusterDetailsFactory,
  clusterFactory,
  checksExecutionCompletedFactory,
  checksExecutionRunningFactory,
} from '@lib/test-utils/factories';

import { providerData } from '@common/ProviderLabel/ProviderLabel';

import AscsErsClusterDetails from './AscsErsClusterDetails';

const userAbilities = [{ name: 'all', resource: 'all' }];

describe('ClusterDetails AscsErsClusterDetails component', () => {
  it('should show the main details of a ASCS/ERS cluster', () => {
    const {
      name,
      cib_last_written: cibLastWritten,
      provider,
      details,
    } = clusterFactory.build({
      type: 'ascs_ers',
    });

    const {
      sid,
      distributed,
      filesystem_resource_based: filesystemResourceBased,
    } = details.sap_systems[0];

    const sapSystems = buildSapSystemsFromAscsErsClusterDetails(details);
    const { ensa_version: ensaVersion } = sapSystems[0];

    renderWithRouter(
      <AscsErsClusterDetails
        clusterName={name}
        cibLastWritten={cibLastWritten}
        provider={provider}
        hosts={buildHostsFromAscsErsClusterDetails(details)}
        sapSystems={sapSystems}
        details={details}
        userAbilities={userAbilities}
      />
    );

    expect(screen.getByText(name)).toBeInTheDocument();

    expect(screen.getByText('Provider').nextSibling).toHaveTextContent(
      providerData[provider].label
    );
    expect(screen.getByText('Cluster type').nextSibling).toHaveTextContent(
      'ASCS/ERS'
    );
    expect(screen.getByText('CIB last written').nextSibling).toHaveTextContent(
      cibLastWritten
    );
    expect(
      screen.getByText('Cluster maintenance').nextSibling
    ).toHaveTextContent('False');

    const sidContainer = screen.getByText('SID').nextSibling;

    expect(sidContainer).toHaveTextContent(sid);
    expect(sidContainer.querySelector('a')).toHaveAttribute(
      'href',
      `/sap_systems/${sapSystems[0].id}`
    );
    expect(screen.getByText('ENSA version').nextSibling).toHaveTextContent(
      ensaVersion === 'no_ensa' ? '-' : ensaVersion.toUpperCase()
    );
    expect(
      screen.getByText('ASCS/ERS distributed').nextSibling
    ).toHaveTextContent(distributed ? 'Yes' : 'No');
    expect(
      screen.getByText('Filesystem resource based').nextSibling
    ).toHaveTextContent(filesystemResourceBased ? 'Yes' : 'No');
  });

  it('should show nodes information', async () => {
    const {
      name,
      cib_last_written: cibLastWritten,
      provider,
      details,
    } = clusterFactory.build({
      type: 'ascs_ers',
    });

    const { nodes } = details.sap_systems[0];

    renderWithRouter(
      <AscsErsClusterDetails
        clusterName={name}
        cibLastWritten={cibLastWritten}
        provider={provider}
        hosts={buildHostsFromAscsErsClusterDetails(details)}
        sapSystems={buildSapSystemsFromAscsErsClusterDetails(details)}
        details={details}
        userAbilities={userAbilities}
      />
    );

    const table = screen.getByRole('table');

    nodes.forEach(
      (
        {
          id: hostId,
          name: nodeName,
          roles,
          virtual_ips: virtualIps,
          filesystems,
        },
        index
      ) => {
        const row = table.querySelector(`tbody > tr:nth-child(${index + 1})`);
        const hostnameCell = row.querySelector('td:nth-child(1)');
        expect(hostnameCell).toHaveTextContent(nodeName);
        expect(hostnameCell.querySelector('a')).toHaveAttribute('href', hostId);
        expect(row.querySelector('td:nth-child(2)')).toHaveTextContent(
          roles[0].toUpperCase()
        );
        expect(row.querySelector('td:nth-child(3)')).toHaveTextContent(
          virtualIps[0]
        );
        expect(row.querySelector('td:nth-child(4)')).toHaveTextContent(
          filesystems[0]
        );
      }
    );
  });

  it('should change selected SAP system details', async () => {
    const user = userEvent.setup();

    const {
      name,
      cib_last_written: cibLastWritten,
      provider,
      details,
    } = clusterFactory.build({
      type: 'ascs_ers',
      details: ascsErsClusterDetailsFactory.build({ sap_systems_count: 2 }),
    });

    const {
      sid: sid1,
      nodes: [{ name: nodeName1 }],
    } = details.sap_systems[0];
    const {
      sid: sid2,
      nodes: [{ name: nodeName2 }],
    } = details.sap_systems[1];

    renderWithRouter(
      <AscsErsClusterDetails
        clusterName={name}
        cibLastWritten={cibLastWritten}
        provider={provider}
        hosts={buildHostsFromAscsErsClusterDetails(details)}
        sapSystems={buildSapSystemsFromAscsErsClusterDetails(details)}
        details={details}
        userAbilities={userAbilities}
      />
    );

    expect(screen.getByText(sid1)).toBeInTheDocument();
    expect(screen.getByText(nodeName1)).toBeInTheDocument();
    await user.click(screen.getByTestId('right-arrow'));
    expect(screen.getByText(sid2)).toBeInTheDocument();
    expect(screen.getByText(nodeName2)).toBeInTheDocument();
  });

  it('should show the SID even if the sap systems enriched data is not available', () => {
    const {
      name,
      cib_last_written: cibLastWritten,
      provider,
      details,
    } = clusterFactory.build({
      type: 'ascs_ers',
    });

    const { sid } = details.sap_systems[0];

    renderWithRouter(
      <AscsErsClusterDetails
        clusterName={name}
        cibLastWritten={cibLastWritten}
        provider={provider}
        hosts={buildHostsFromAscsErsClusterDetails(details)}
        sapSystems={[]}
        details={details}
        userAbilities={userAbilities}
      />
    );

    const sidContainer = screen.getByText('SID').nextSibling;

    expect(sidContainer).toHaveTextContent(sid);
    expect(sidContainer.querySelector('a')).toBeNull();
  });

  it('should not display a host link for unregistered hosts', () => {
    const {
      name,
      cib_last_written: cibLastWritten,
      provider,
      details,
    } = clusterFactory.build({ type: 'ascs_ers' });

    const hosts = buildHostsFromAscsErsClusterDetails(details);
    const unregisteredHost = hosts.pop();

    renderWithRouter(
      <AscsErsClusterDetails
        clusterName={name}
        hosts={hosts}
        cibLastWritten={cibLastWritten}
        provider={provider}
        sapSystems={[]}
        details={details}
        userAbilities={userAbilities}
      />
    );
    const unregisteredHostContainer = screen.getByText(
      unregisteredHost.hostname
    );

    expect(unregisteredHostContainer).not.toHaveAttribute('href');
  });

  it('should display infos about node details', async () => {
    const {
      name,
      cib_last_written: cibLastWritten,
      provider,
      details,
    } = clusterFactory.build({
      type: 'ascs_ers',
      details: ascsErsClusterDetailsFactory.build({ sap_systems_count: 2 }),
    });

    const sapSystems = buildSapSystemsFromAscsErsClusterDetails(details);

    const {
      nodes: [{ attributes }],
    } = details.sap_systems[0];

    renderWithRouter(
      <AscsErsClusterDetails
        clusterName={name}
        cibLastWritten={cibLastWritten}
        provider={provider}
        hosts={buildHostsFromAscsErsClusterDetails(details)}
        sapSystems={sapSystems}
        details={details}
        userAbilities={userAbilities}
      />
    );

    await userEvent.click(screen.getAllByText('Details')[0]);

    expect(screen.getByText('Node Details')).toBeInTheDocument();
    expect(screen.getByText('Attributes')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();

    Object.keys(attributes).forEach((key) => {
      screen.getAllByText(key).forEach((element) => {
        expect(element).toBeInTheDocument();
      });

      screen.getAllByText(attributes[key]).forEach((element) => {
        expect(element).toBeInTheDocument();
      });
    });
  });

  it('should suggest to the user to select some checks if the selection is empty', async () => {
    const user = userEvent.setup();

    const {
      clusterID,
      clusterName,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sid,
      provider,
      details,
    } = clusterFactory.build({ type: 'ascs_ers' });

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    renderWithRouter(
      <AscsErsClusterDetails
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
        userAbilities={userAbilities}
      />
    );

    const startExecutionButton = screen.getByText('Start Execution');
    await user.hover(startExecutionButton);
    expect(screen.queryByText('Select some Checks first!')).toBeVisible();
  });

  const executionId = faker.string.uuid();

  const executionScenarios = [
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

  it.each(executionScenarios)(
    'should disable starting a new execution when $name',
    ({ selectedChecks, hasSelectedChecks, lastExecution }) => {
      const hanaCluster = clusterFactory.build({
        type: 'ascs_ers',
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

      renderWithRouter(
        <AscsErsClusterDetails
          clusterID={clusterID}
          clusterName={clusterName}
          selectedChecks={selectedChecks}
          hasSelectedChecks={hasSelectedChecks}
          hosts={hosts}
          clusterType={clusterType}
          cibLastWritten={cibLastWritten}
          sid={sid}
          provider={provider}
          sapSystems={[]}
          details={details}
          lastExecution={lastExecution}
          userAbilities={userAbilities}
        />
      );

      expect(screen.getByText('Start Execution')).toBeDisabled();
    }
  );

  describe('forbidden actions', () => {
    it('should disable check execution button when the user abilities are not compatible', async () => {
      const user = userEvent.setup();

      const {
        clusterID,
        clusterName,
        cib_last_written: cibLastWritten,
        type: clusterType,
        sid,
        provider,
        details,
      } = clusterFactory.build({ type: 'ascs_ers' });

      const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

      renderWithRouter(
        <AscsErsClusterDetails
          clusterID={clusterID}
          clusterName={clusterName}
          selectedChecks={['ABCD']}
          hasSelectedChecks
          hosts={hosts}
          clusterType={clusterType}
          cibLastWritten={cibLastWritten}
          sid={sid}
          provider={provider}
          sapSystems={[]}
          details={details}
          lastExecution={null}
          userAbilities={[{ name: 'all', resource: 'other' }]}
        />
      );

      const startExecutionButton = screen.getByText('Start Execution');
      await user.hover(startExecutionButton);
      expect(
        screen.queryByText('You are not authorized for this action')
      ).toBeInTheDocument();
    });

    it('should enable check execution button when the user abilities are compatible', async () => {
      const user = userEvent.setup();

      const {
        clusterID,
        clusterName,
        cib_last_written: cibLastWritten,
        type: clusterType,
        sid,
        provider,
        details,
      } = clusterFactory.build({ type: 'ascs_ers' });

      const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

      renderWithRouter(
        <AscsErsClusterDetails
          clusterID={clusterID}
          clusterName={clusterName}
          selectedChecks={['ABCD']}
          hasSelectedChecks
          hosts={hosts}
          clusterType={clusterType}
          cibLastWritten={cibLastWritten}
          sid={sid}
          provider={provider}
          sapSystems={[]}
          details={details}
          lastExecution={null}
          userAbilities={[
            { name: 'all', resource: 'cluster_checks_execution' },
          ]}
        />
      );

      const startExecutionButton = screen.getByText('Start Execution');
      await user.hover(startExecutionButton);
      expect(
        screen.queryByText('You are not authorized for this action')
      ).not.toBeInTheDocument();
    });
  });
});
