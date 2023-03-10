import React from 'react';
import { screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';

import '@testing-library/jest-dom';
import ExecutionHeader from './ExecutionHeader';

describe('Cluster Checks results ExecutionHeader Component', () => {
  it('should render a header with expected information', () => {
    const clusterID = faker.datatype.uuid();
    const clusterName = faker.animal.bear();
    const cloudProvider = 'azure';
    const clusterScenario = 'hana_scale_up';

    renderWithRouter(
      <ExecutionHeader
        clusterID={clusterID}
        clusterName={clusterName}
        cloudProvider={cloudProvider}
        clusterScenario={clusterScenario}
      />
    );

    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getByText('HANA scale-up')).toBeTruthy();
    expect(screen.getByText(clusterName));
  });

  it('should render a header with a warning banner on an unknown provider detection', () => {
    const clusterID = faker.datatype.uuid();
    const clusterName = faker.animal.bear();
    const cloudProvider = 'unknown';
    const clusterScenario = 'hana_scale_up';

    renderWithRouter(
      <ExecutionHeader
        clusterID={clusterID}
        clusterName={clusterName}
        cloudProvider={cloudProvider}
        clusterScenario={clusterScenario}
      />
    );

    expect(screen.getByText('Provider not recognized')).toBeTruthy();
    expect(screen.getByText('HANA scale-up')).toBeTruthy();
    expect(
      screen.getByText(
        /The following catalog is valid for on-premise bare metal platforms./
      )
    ).toBeTruthy();
  });
});
