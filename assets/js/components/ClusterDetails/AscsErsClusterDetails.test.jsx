import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithRouter } from '@lib/test-utils';
import userEvent from '@testing-library/user-event';

import {
  addHostsToAscsErsClusterDetails,
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

    renderWithRouter(
      <AscsErsClusterDetails
        clusterName={name}
        cibLastWritten={cibLastWritten}
        provider={provider}
        hosts={addHostsToAscsErsClusterDetails(details)}
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

    expect(screen.getByText('SID').nextSibling).toHaveTextContent(sid);
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
        hosts={addHostsToAscsErsClusterDetails(details)}
        details={details}
      />
    );

    const table = screen.getByRole('table');

    nodes.forEach(
      async (
        {
          id: clusterID,
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
            .toHaveAttributes('href', clusterID);
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
        hosts={addHostsToAscsErsClusterDetails(details)}
        details={details}
      />
    );

    expect(screen.getByText(sid1)).toBeInTheDocument();
    expect(screen.getByText(nodeName1)).toBeInTheDocument();
    await user.click(screen.getByTestId('right-arrow'));
    expect(screen.getByText(sid2)).toBeInTheDocument();
    expect(screen.getByText(nodeName2)).toBeInTheDocument();
  });
});
