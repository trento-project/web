import React from 'react';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { withState, defaultInitialState } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import { Route, Routes, MemoryRouter } from 'react-router-dom';
import { ClusterSettings } from './ClusterSettings';

describe('ClusterDetails ClusterSettings component', () => {
  it('should render the cluster info box and the catalog container', async () => {
    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group });

    const [StatefulChecksSettings, state] = withState(<ClusterSettings />, {
      ...defaultInitialState,
      catalog: { loading: false, data: catalog, error: null },
    });

    const {
      clusters: [, , , { id: clusterID }],
    } = state.getState().clustersList;

    render(
      <MemoryRouter initialEntries={[`/clusters/${clusterID}/settings`]}>
        <Routes>
          <Route
            path="clusters/:clusterID/settings"
            element={StatefulChecksSettings}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Provider')).toBeVisible();
    expect(screen.getByText('Azure')).toBeVisible();
    expect(screen.getByText(group)).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Select Checks for Execution' })
    ).toBeVisible();
  });
});
