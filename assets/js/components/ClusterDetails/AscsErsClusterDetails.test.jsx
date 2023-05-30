import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithRouter } from '@lib/test-utils';
import userEvent from '@testing-library/user-event';

import {
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

    const { sid: sid1 } = details.sap_systems[0];
    const { sid: sid2 } = details.sap_systems[1];

    renderWithRouter(
      <AscsErsClusterDetails
        clusterName={name}
        cibLastWritten={cibLastWritten}
        provider={provider}
        details={details}
      />
    );

    expect(screen.getByText(sid1)).toBeInTheDocument();
    await user.click(screen.getByTestId('right-arrow'));
    expect(screen.getByText(sid2)).toBeInTheDocument();
  });
});
