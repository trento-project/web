import React from 'react';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { withState, defaultInitialState } from '@lib/test-utils';
import { catalogCheckFactory, clusterFactory } from '@lib/test-utils/factories';

import { Route, Routes, MemoryRouter } from 'react-router-dom';
import { ClusterSettings, UNKNOWN_PROVIDER } from './ClusterSettings';

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

  it('given VMware provider, should render the warning banner', async () => {
    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group });
    const clusters = clusterFactory.buildList(1, { provider: 'vmware' });

    const state = {
      ...defaultInitialState,
      catalog: { loading: false, data: catalog, error: null },
      clustersList: { clusters },
    };
    const { id: clusterID } = clusters[0];

    const [StatefulChecksSettings] = withState(<ClusterSettings />, state);

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
    expect(screen.getByText('VMware')).toBeVisible();
    expect(screen.getByText(group)).toBeVisible();
    expect(
      screen.getByText(
        'Configuration checks for HANA scale-up performance optimized clusters on VMware are still in experimental phase. Please use results with caution.'
      )
    ).toBeVisible();
  });

  it('given unknown provider, should render the warning banner', async () => {
    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group });
    const clusters = clusterFactory.buildList(1, {
      provider: UNKNOWN_PROVIDER,
    });

    const state = {
      ...defaultInitialState,
      catalog: { loading: false, data: catalog, error: null },
      clustersList: { clusters },
    };
    const { id: clusterID } = clusters[0];

    const [StatefulChecksSettings] = withState(<ClusterSettings />, state);

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
    expect(screen.getByText('Provider not recognized')).toBeVisible();
    expect(screen.getByText(group)).toBeVisible();
    expect(
      screen.getByText(
        /The following catalog is valid for on-premise bare metal platforms.*If you are running your HANA cluster on a different platform, please use results with caution/
      )
    ).toBeVisible();
  });
});
