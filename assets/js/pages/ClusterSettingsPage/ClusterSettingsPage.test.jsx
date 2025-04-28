import React from 'react';

import { act, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { faker } from '@faker-js/faker';
import {
  withState,
  defaultInitialState,
  renderWithRouterMatch,
} from '@lib/test-utils';
import {
  clusterFactory,
  selectableCheckFactory,
} from '@lib/test-utils/factories';

import { UNKNOWN_PROVIDER } from '@lib/model';

import ClusterSettingsPage from '.';

const axiosMock = new MockAdapter(networkClient);

describe('ClusterDetails ClusterSettings component', () => {
  it('should render the cluster info box and the catalog container', async () => {
    const group = faker.animal.cat();
    const selectableChecks = selectableCheckFactory.buildList(2, { group });

    const [StatefulClusterSettings, state] = withState(
      <ClusterSettingsPage />,
      {
        ...defaultInitialState,
        user: { abilities: [] },
      }
    );

    const {
      clusters: [, , , { id: clusterID }],
    } = state.getState().clustersList;

    axiosMock
      .onGet(`/api/v1/groups/${clusterID}/checks`)
      .reply(200, { items: selectableChecks });

    await act(async () => {
      renderWithRouterMatch(StatefulClusterSettings, {
        path: 'clusters/:clusterID/settings',
        route: `/clusters/${clusterID}/settings`,
      });
    });

    expect(screen.getByText('Provider')).toBeVisible();
    expect(screen.getByText('Azure')).toBeVisible();
    expect(screen.getByText(group)).toBeVisible();
    expect(screen.getByText('Save Checks Selection')).toBeVisible();
  });

  it('given unknown provider, should render the warning banner', async () => {
    const group = faker.animal.cat();
    const selectableChecks = selectableCheckFactory.buildList(2, { group });
    const clusters = clusterFactory.buildList(1, {
      provider: UNKNOWN_PROVIDER,
    });

    const state = {
      ...defaultInitialState,
      clustersList: { clusters },
      user: { abilities: [] },
    };
    const { id: clusterID } = clusters[0];

    const [StatefulChecksSettings] = withState(<ClusterSettingsPage />, state);

    axiosMock
      .onGet(`/api/v1/groups/${clusterID}/checks`)
      .reply(200, { items: selectableChecks });

    await act(async () => {
      renderWithRouterMatch(StatefulChecksSettings, {
        path: 'clusters/:clusterID/settings',
        route: `/clusters/${clusterID}/settings`,
      });
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
    async ({ cluster, suggestionExpectation }) => {
      const { id: clusterID } = cluster;
      const [StatefulClusterSettings] = withState(<ClusterSettingsPage />, {
        ...defaultInitialState,
        clustersList: { clusters: [cluster] },
        user: { abilities: [{ name: 'all', resource: 'all' }] },
      });

      await act(async () => {
        renderWithRouterMatch(StatefulClusterSettings, {
          path: 'clusters/:clusterID/settings',
          route: `/clusters/${clusterID}/settings`,
        });
      });
      const user = userEvent.setup();
      await user.hover(screen.getByText('Start Execution'));

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
