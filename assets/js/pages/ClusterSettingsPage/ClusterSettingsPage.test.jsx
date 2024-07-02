import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import {
  withState,
  defaultInitialState,
  renderWithRouterMatch,
} from '@lib/test-utils';
import { catalogCheckFactory, clusterFactory } from '@lib/test-utils/factories';

import { UNKNOWN_PROVIDER } from '@lib/model';

import ClusterSettingsPage from '.';

describe('ClusterDetails ClusterSettings component', () => {
  it('should render the cluster info box and the catalog container', async () => {
    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group });

    const [StatefulClusterSettings, state] = withState(
      <ClusterSettingsPage />,
      {
        ...defaultInitialState,
        catalog: { loading: false, data: catalog, error: null },
        user: { abilities: [] },
      }
    );

    const {
      clusters: [, , , { id: clusterID }],
    } = state.getState().clustersList;

    renderWithRouterMatch(StatefulClusterSettings, {
      path: 'clusters/:clusterID/settings',
      route: `/clusters/${clusterID}/settings`,
    });

    expect(screen.getByText('Provider')).toBeVisible();
    expect(screen.getByText('Azure')).toBeVisible();
    expect(screen.getByText(group)).toBeVisible();
    expect(screen.getByText('Save Checks Selection')).toBeVisible();
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
      user: { abilities: [] },
    };
    const { id: clusterID } = clusters[0];

    const [StatefulChecksSettings] = withState(<ClusterSettingsPage />, state);

    renderWithRouterMatch(StatefulChecksSettings, {
      path: 'clusters/:clusterID/settings',
      route: `/clusters/${clusterID}/settings`,
    });

    expect(screen.getByText('Provider')).toBeVisible();
    expect(screen.getByText('Provider not recognized')).toBeVisible();
    expect(screen.getByText(group)).toBeVisible();
    expect(
      screen.getByText(
        /The following catalog is valid for on-premise bare metal platforms.*If you are running your HANA cluster on a different platform, please use results with caution/
      )
    ).toBeVisible();
  });

  const suggestionScenarios = [
    {
      cluster: clusterFactory.build({
        selected_checks: [],
      }),
      suggestionExpectation: (tooltipSuggestion) => {
        tooltipSuggestion.not.toBeInTheDocument();
      },
    },
    {
      cluster: clusterFactory.build({
        selected_checks: [faker.string.uuid()],
      }),
      suggestionExpectation: (tooltipSuggestion) => {
        tooltipSuggestion.toBeVisible();
      },
    },
  ];

  it.each(suggestionScenarios)(
    'should suggest to the user to start an execution when the selection is not empty',
    ({ cluster, suggestionExpectation }) => {
      const { id: clusterID } = cluster;
      const [StatefulClusterSettings] = withState(<ClusterSettingsPage />, {
        ...defaultInitialState,
        clustersList: { clusters: [cluster] },
        user: { abilities: [{ name: 'all', resource: 'all' }] },
      });

      renderWithRouterMatch(StatefulClusterSettings, {
        path: 'clusters/:clusterID/settings',
        route: `/clusters/${clusterID}/settings`,
      });

      suggestionExpectation(
        expect(
          screen.queryByText(
            'Click Start Execution or wait for Trento to periodically run checks.'
          )
        )
      );
    }
  );
});
