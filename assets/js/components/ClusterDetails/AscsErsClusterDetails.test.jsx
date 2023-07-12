import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithRouter } from '@lib/test-utils';
import userEvent from '@testing-library/user-event';

import {
  buildHostsFromAscsErsClusterDetails,
  buildSapSystemsFromAscsErsClusterDetails,
  ascsErsClusterDetailsFactory,
  clusterFactory,
} from '@lib/test-utils/factories';

import { providerData } from '@components/ProviderLabel/ProviderLabel';

import AscsErsClusterDetails from './AscsErsClusterDetails';

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
      />
    );

    const table = screen.getByRole('table');

    nodes.forEach(
      async (
        {
          id: hostId,
          name: nodeName,
          role,
          virtual_ip: virtualIp,
          filesysten,
        },
        index
      ) => {
        await waitFor(() => {
          const row = table.querySelector(`tbody > tr:nth-child(${index}`);
          const hostnameCell = row.querySelector('td:nth-child(0)');
          expect(hostnameCell).toHaveTextContent(nodeName);
          expect(hostnameCell)
            .querySelector('a')
            .toHaveAttributes('href', hostId);
          expect(row.querySelector('td:nth-child(1)')).toHaveTextContent(role);
          expect(row.querySelector('td:nth-child(2)')).toHaveTextContent(
            virtualIp
          );
          expect(row.querySelector('td:nth-child(3)')).toHaveTextContent(
            filesysten
          );
        });
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
    const unregisteredHost = hosts.pop()

    renderWithRouter(
      <AscsErsClusterDetails
        clusterName={name}
        hosts={hosts}
        cibLastWritten={cibLastWritten}
        provider={provider}
        sapSystems={[]}
        details={details}
      />
    );
    const unregisteredHostContainer = screen.getByText(unregisteredHost.hostname);

    expect(unregisteredHostContainer).not.toHaveAttribute(
      'href'
    );
  });
});
