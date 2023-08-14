import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { catalogCheckFactory, hostFactory } from '@lib/test-utils/factories';

import HostChecksSelection from './HostChecksSelection';
import { renderWithRouter } from '../../lib/test-utils';

describe('HostChecksSelection component', () => {
  it('should render host check selection', async () => {
    const group0 = faker.animal.cat();
    const group1 = faker.animal.dog();
    const group2 = faker.lorem.word();
    const catalog = [
      ...catalogCheckFactory.buildList(2, { group: group0 }),
      ...catalogCheckFactory.buildList(2, { group: group1 }),
      ...catalogCheckFactory.buildList(2, { group: group2 }),
    ];

    const onUpdateCatalog = jest.fn();

    const {
      id: hostID,
      hostname: hostName,
      provider,
      agent_version: agentVersion,
      selected_checks: selectedChecks,
    } = hostFactory.build({ provider: 'azure' });

    renderWithRouter(
      <HostChecksSelection
        hostID={hostID}
        hostName={hostName}
        provider={provider}
        agentVersion={agentVersion}
        selectedChecks={selectedChecks}
        catalog={catalog}
        catalogError={null}
        catalogLoading={false}
        onUpdateCatalog={onUpdateCatalog}
        hostSelectedChecks={selectedChecks}
      />
    );

    expect(screen.getByText('Provider')).toBeVisible();
    expect(screen.getByText('Azure')).toBeVisible();
    expect(screen.getByText('Agent version')).toBeVisible();
    expect(screen.getByText(agentVersion)).toBeVisible();
    expect(screen.getByText(group0)).toBeVisible();
    expect(screen.getByText(group1)).toBeVisible();
    expect(screen.getByText(group2)).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Back to Host Details' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Save Checks Selection' })
    ).toBeVisible();
    expect(onUpdateCatalog).toHaveBeenCalled();
  });
});
