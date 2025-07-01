import React from 'react';

import { noop } from 'lodash';

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
  CLUSTER_MAINTENANCE_CHANGE,
} from '@lib/operations';

import { renderWithRouter } from '@lib/test-utils';

import {
  buildHostsFromAscsErsClusterDetails,
  buildSapSystemsFromAscsErsClusterDetails,
  ascsErsClusterDetailsFactory,
  clusterFactory,
} from '@lib/test-utils/factories';

import { providerData } from '@common/ProviderLabel/ProviderLabel';

import AscsErsClusterDetails from './AscsErsClusterDetails';
import { getClusterHostOperations } from './clusterOperations';

describe('ClusterDetails AscsErsClusterDetails component', () => {
  it('should show the main details of a ASCS/ERS cluster', () => {
    const {
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
        cibLastWritten={cibLastWritten}
        provider={provider}
        hosts={buildHostsFromAscsErsClusterDetails(details)}
        sapSystems={sapSystems}
        details={details}
      />
    );

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
      cib_last_written: cibLastWritten,
      provider,
      details,
    } = clusterFactory.build({
      type: 'ascs_ers',
    });

    const { nodes } = details.sap_systems[0];

    renderWithRouter(
      <AscsErsClusterDetails
        cibLastWritten={cibLastWritten}
        provider={provider}
        hosts={buildHostsFromAscsErsClusterDetails(details)}
        sapSystems={buildSapSystemsFromAscsErsClusterDetails(details)}
        details={details}
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
        cibLastWritten={cibLastWritten}
        provider={provider}
        hosts={buildHostsFromAscsErsClusterDetails(details)}
        sapSystems={buildSapSystemsFromAscsErsClusterDetails(details)}
        details={details}
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
      cib_last_written: cibLastWritten,
      provider,
      details,
    } = clusterFactory.build({
      type: 'ascs_ers',
    });

    const { sid } = details.sap_systems[0];

    renderWithRouter(
      <AscsErsClusterDetails
        cibLastWritten={cibLastWritten}
        provider={provider}
        hosts={buildHostsFromAscsErsClusterDetails(details)}
        sapSystems={[]}
        details={details}
      />
    );

    const sidContainer = screen.getByText('SID').nextSibling;

    expect(sidContainer).toHaveTextContent(sid);
    expect(sidContainer.querySelector('a')).toBeNull();
  });

  it('should not display a host link for unregistered hosts', () => {
    const {
      cib_last_written: cibLastWritten,
      provider,
      details,
    } = clusterFactory.build({ type: 'ascs_ers' });

    const hosts = buildHostsFromAscsErsClusterDetails(details);
    const unregisteredHost = hosts.pop();

    renderWithRouter(
      <AscsErsClusterDetails
        hosts={hosts}
        cibLastWritten={cibLastWritten}
        provider={provider}
        sapSystems={[]}
        details={details}
      />
    );
    const unregisteredHostContainer = screen.getByText(
      unregisteredHost.hostname
    );

    expect(unregisteredHostContainer).not.toHaveAttribute('href');
  });

  it('should display infos about node details', async () => {
    const {
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
        cibLastWritten={cibLastWritten}
        provider={provider}
        hosts={buildHostsFromAscsErsClusterDetails(details)}
        sapSystems={sapSystems}
        details={details}
      />
    );

    await userEvent.click(screen.getAllByText('Details')[0]);

    expect(screen.getByText('Node Details')).toBeInTheDocument();
    expect(screen.getByText('Attributes')).toBeInTheDocument();

    Object.keys(attributes).forEach((key) => {
      screen.getAllByText(key).forEach((element) => {
        expect(element).toBeInTheDocument();
      });

      screen.getAllByText(attributes[key]).forEach((element) => {
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('cluster hosts operations', () => {
    const scenarios = [
      {
        name: 'enabled when no other operation is running',
        runningOperation: null,
        expectedOperationEnabled: true,
      },
      {
        name: 'disabled when a pacemaker_enable is running',
        runningOperation: { group_id: '123', operation: PACEMAKER_ENABLE },
        expectedOperationEnabled: false,
      },
      {
        name: 'disabled when a pacemaker_disable is running',
        runningOperation: { group_id: '123', operation: PACEMAKER_DISABLE },
        expectedOperationEnabled: false,
      },
      {
        name: 'disabled when a cluster maintenance change is running',
        runningOperation: {
          group_id: '123',
          operation: CLUSTER_MAINTENANCE_CHANGE,
        },
        expectedOperationEnabled: false,
      },
    ];

    it.each(scenarios)(
      'should show cluster host operations: $name',
      async ({ runningOperation, expectedOperationEnabled }) => {
        const user = userEvent.setup();

        const { id: clusterID, details } = clusterFactory.build({
          type: 'ascs_ers',
        });

        renderWithRouter(
          <AscsErsClusterDetails
            hosts={buildHostsFromAscsErsClusterDetails(details)}
            sapSystems={buildSapSystemsFromAscsErsClusterDetails(details)}
            details={details}
            userAbilities={[{ name: 'all', resource: 'all' }]}
            getClusterHostOperations={getClusterHostOperations(
              clusterID,
              runningOperation,
              noop,
              noop
            )}
          />
        );

        const nodesTable = screen.getByRole('table');

        const { getAllByRole } = within(nodesTable);

        const [
          operationBtnHost1,
          _detailsBtnHost1,
          _operationBtnHost2,
          _detailsBtnHost2,
        ] = getAllByRole('button');

        await user.click(operationBtnHost1);

        const enablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Enable pacemaker at boot',
        });
        const disablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Disable pacemaker at boot',
        });

        expect(enablePacemakerHost1).toBeVisible();
        expect(disablePacemakerHost1).toBeVisible();
        if (expectedOperationEnabled) {
          expect(enablePacemakerHost1).toBeEnabled();
          expect(disablePacemakerHost1).toBeEnabled();
        } else {
          expect(enablePacemakerHost1).toBeDisabled();
          expect(disablePacemakerHost1).toBeDisabled();
        }
      }
    );

    const runningOperationsScenarios = [
      {
        name: 'pacemaker_enable running',
        runningOperation: (clusterID, { id }) => ({
          groupID: clusterID,
          operation: PACEMAKER_ENABLE,
          metadata: { hostID: id },
        }),
        expectedEnablePacemakerRunning: true,
        expectedDisablePacemakerRunning: false,
      },
      {
        name: 'pacemaker_disable running',
        runningOperation: (clusterID, { id }) => ({
          groupID: clusterID,
          operation: PACEMAKER_DISABLE,
          metadata: { hostID: id },
        }),
        expectedEnablePacemakerRunning: false,
        expectedDisablePacemakerRunning: true,
      },
      {
        name: 'cluster maintenance change running',
        runningOperation: (clusterID) => ({
          groupID: clusterID,
          operation: CLUSTER_MAINTENANCE_CHANGE,
        }),
        expectedEnablePacemakerRunning: false,
        expectedDisablePacemakerRunning: false,
      },
    ];

    it.each(runningOperationsScenarios)(
      'should show cluster host operations running state: $name',
      async ({
        runningOperation,
        expectedEnablePacemakerRunning,
        expectedDisablePacemakerRunning,
      }) => {
        const user = userEvent.setup();

        const { id: clusterID, details } = clusterFactory.build({
          type: 'ascs_ers',
        });

        const host = buildHostsFromAscsErsClusterDetails(details)[0];

        renderWithRouter(
          <AscsErsClusterDetails
            hosts={[host]}
            sapSystems={buildSapSystemsFromAscsErsClusterDetails(details)}
            details={details}
            userAbilities={[{ name: 'all', resource: 'all' }]}
            getClusterHostOperations={getClusterHostOperations(
              clusterID,
              runningOperation(clusterID, host),
              noop,
              noop
            )}
          />
        );

        const nodesTable = screen.getByRole('table');

        const { getAllByRole } = within(nodesTable);

        const [operationBtnHost1, _detailsBtnHost1] = getAllByRole('button');

        await user.click(operationBtnHost1);

        const enablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Enable pacemaker at boot',
        });
        const disablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Disable pacemaker at boot',
        });

        expect(enablePacemakerHost1).toBeDisabled();
        expect(disablePacemakerHost1).toBeDisabled();

        const { queryByTestId: enablePacemakerIconFinder } =
          within(enablePacemakerHost1);

        expectedEnablePacemakerRunning
          ? expect(
              enablePacemakerIconFinder('eos-svg-component')
            ).toBeInTheDocument()
          : expect(enablePacemakerIconFinder('eos-svg-component')).toBeNull();

        const { queryByTestId: disablePacemakerIconFinder } = within(
          disablePacemakerHost1
        );

        expectedDisablePacemakerRunning
          ? expect(
              disablePacemakerIconFinder('eos-svg-component')
            ).toBeInTheDocument()
          : expect(disablePacemakerIconFinder('eos-svg-component')).toBeNull();
      }
    );

    const userAbilitiesScenarios = [
      {
        name: 'no abilities, all operations forbidden',
        userAbilities: [],
        enablePacemakerAllowed: false,
        disablePacemakerAllowed: false,
      },
      {
        name: 'can only enable pacemaker',
        userAbilities: [{ name: 'pacemaker_enable', resource: 'cluster' }],
        enablePacemakerAllowed: true,
        disablePacemakerAllowed: false,
      },
      {
        name: 'can only disable pacemaker',
        userAbilities: [{ name: 'pacemaker_disable', resource: 'cluster' }],
        enablePacemakerAllowed: false,
        disablePacemakerAllowed: true,
      },
      {
        name: 'admin can perform all operations',
        userAbilities: [{ name: 'all', resource: 'all' }],
        enablePacemakerAllowed: true,
        disablePacemakerAllowed: true,
      },
      {
        name: 'can perform all operations with relevant abilities',
        userAbilities: [
          { name: 'pacemaker_enable', resource: 'cluster' },
          { name: 'pacemaker_disable', resource: 'cluster' },
        ],
        enablePacemakerAllowed: true,
        disablePacemakerAllowed: true,
      },
    ];

    it.each(userAbilitiesScenarios)(
      'should allow/forbid operations based on user abilities: $name',
      async ({
        userAbilities,
        enablePacemakerAllowed,
        disablePacemakerAllowed,
      }) => {
        const user = userEvent.setup();

        const { id: clusterID, details } = clusterFactory.build({
          type: 'ascs_ers',
        });

        const runningOperation = null;

        renderWithRouter(
          <AscsErsClusterDetails
            hosts={buildHostsFromAscsErsClusterDetails(details)}
            sapSystems={buildSapSystemsFromAscsErsClusterDetails(details)}
            details={details}
            userAbilities={userAbilities}
            getClusterHostOperations={getClusterHostOperations(
              clusterID,
              runningOperation,
              noop,
              noop
            )}
          />
        );

        const nodesTable = screen.getByRole('table');

        const { getAllByRole } = within(nodesTable);

        const [
          operationBtnHost1,
          _detailsBtnHost1,
          _operationBtnHost2,
          _detailsBtnHost2,
        ] = getAllByRole('button');

        await user.click(operationBtnHost1);

        const enablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Enable pacemaker at boot',
        });
        const disablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Disable pacemaker at boot',
        });

        enablePacemakerAllowed
          ? expect(enablePacemakerHost1).toBeEnabled()
          : expect(enablePacemakerHost1).toBeDisabled();
        disablePacemakerAllowed
          ? expect(disablePacemakerHost1).toBeEnabled()
          : expect(disablePacemakerHost1).toBeDisabled();
      }
    );
  });
});
