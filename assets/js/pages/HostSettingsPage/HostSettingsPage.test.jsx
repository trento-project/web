// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';

import { act, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import {
  withState,
  defaultInitialState,
  renderWithRouterMatch,
} from '@lib/test-utils';

import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { hostFactory, selectableCheckFactory } from '@lib/test-utils/factories';
import { checksScheduleFactory } from '@lib/test-utils/factories/checksSchedules';

import { fetchChecksSchedule } from '@state/checksSchedules';

import HostSettingsPage from './HostSettingsPage';

const axiosMock = new MockAdapter(networkClient);

describe('HostSettingsPage component', () => {
  it('should render a loading box', async () => {
    const state = {
      ...defaultInitialState,
      hostsList: { hosts: [] },
      user: { abilities: [] },
    };

    const [StatefulHostSettingsPage] = withState(<HostSettingsPage />, state);

    await act(async () => {
      renderWithRouterMatch(StatefulHostSettingsPage, {
        path: 'hosts/:hostID/settings',
        route: `/hosts/${faker.string.uuid()}/settings`,
      });
    });

    expect(screen.getByText('Loading...')).toBeVisible();
    expect(screen.queryByText('Provider')).not.toBeTruthy();
    expect(screen.queryByText('Agent version')).not.toBeTruthy();
    expect(screen.queryByText('Architecture')).not.toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Save Check Selection' })
    ).not.toBeTruthy();
  });

  it('should render the host checks selection', async () => {
    const group0 = faker.animal.cat();
    const group1 = faker.animal.dog();
    const group2 = faker.lorem.word();
    const selectableChecks = [
      ...selectableCheckFactory.buildList(2, { group: group0 }),
      ...selectableCheckFactory.buildList(2, { group: group1 }),
      ...selectableCheckFactory.buildList(2, { group: group2 }),
    ];
    const hosts = hostFactory.buildList(3, { provider: 'azure' });

    const state = {
      ...defaultInitialState,
      hostsList: { hosts },
      user: { abilities: [] },
    };
    const { id: hostID, agent_version: agentVersion, arch } = hosts[1];

    const [StatefulHostSettingsPage] = withState(<HostSettingsPage />, state);

    axiosMock
      .onGet(`/api/v1/groups/${hostID}/checks`)
      .reply(200, { items: selectableChecks });

    await act(async () => {
      renderWithRouterMatch(StatefulHostSettingsPage, {
        path: 'hosts/:hostID/settings',
        route: `/hosts/${hostID}/settings`,
      });
    });

    expect(screen.getByText('Provider')).toBeVisible();
    expect(screen.getByText('Azure')).toBeVisible();
    expect(screen.getByText('Agent version')).toBeVisible();
    expect(screen.getByText(agentVersion)).toBeVisible();
    expect(screen.getByText('Architecture')).toBeVisible();
    expect(screen.getByText(arch)).toBeVisible();
    expect(screen.getByText(group0)).toBeVisible();
    expect(screen.getByText(group1)).toBeVisible();
    expect(screen.getByText(group2)).toBeVisible();

    expect(screen.getByText('Save Checks Selection')).toBeVisible();
  });

  it('should render the check executions of the host', async () => {
    const hosts = hostFactory.buildList(2, { provider: 'azure' });
    const { id: hostID } = hosts[1];
    const state = {
      ...defaultInitialState,
      hostsList: { hosts },
      user: { abilities: [{ name: 'all', resource: 'host_checks_frequency' }] },
      checksSchedules: {
        host: {
          [hostID]: {
            loading: false,
            data: checksScheduleFactory.build({
              enabled: true,
              frequency: { value: 6, unit: 'hour' },
              global: false,
            }),
            networkError: false,
            editing: false,
            errors: [],
          },
        },
        cluster: {},
      },
    };

    const [StatefulHostSettingsPage, store] = withState(
      <HostSettingsPage />,
      state
    );

    await act(async () => {
      renderWithRouterMatch(StatefulHostSettingsPage, {
        path: 'hosts/:hostID/settings',
        route: `/hosts/${hostID}/settings`,
      });
    });

    expect(
      screen.getByRole('heading', { name: 'Host Check Executions' })
    ).toBeVisible();
    expect(screen.getByLabelText('checks-frequency')).toHaveTextContent(
      'Every 6 hours'
    );
    expect(screen.getByRole('button', { name: 'Edit Settings' })).toBeEnabled();
    expect(store.getActions()).toContainEqual(
      fetchChecksSchedule({ targetType: 'host', targetID: hostID })
    );
  });

  it('should render HostSettingsPage with a disabled start execution button, as no checks are selected', async () => {
    const hosts = hostFactory.buildList(2, {
      provider: 'azure',
      selected_checks: [],
    });
    const state = {
      ...defaultInitialState,
      hostsList: { hosts },
      user: { abilities: [{ name: 'all', resource: 'host_checks_execution' }] },
    };
    const { id: hostID } = hosts[1];

    const [StatefulHostSettingsPage] = withState(<HostSettingsPage />, state);

    await act(async () => {
      renderWithRouterMatch(StatefulHostSettingsPage, {
        path: 'hosts/:hostID/settings',
        route: `/hosts/${hostID}/settings`,
      });
    });
    const startExecutionButton = screen.getByText('Start Execution');
    expect(startExecutionButton).toBeDisabled();
  });

  it('should render HostSettingsPage with an enabled start execution button, as checks are selected', async () => {
    const hosts = hostFactory.buildList(2, {
      provider: 'azure',
      selected_checks: [faker.animal.bear(), faker.animal.bear()],
    });
    const state = {
      ...defaultInitialState,
      hostsList: { hosts },
      user: { abilities: [{ name: 'all', resource: 'host_checks_execution' }] },
    };
    const { id: hostID } = hosts[1];
    const [StatefulHostSettingsPage] = withState(<HostSettingsPage />, state);

    await act(async () => {
      renderWithRouterMatch(StatefulHostSettingsPage, {
        path: 'hosts/:hostID/settings',
        route: `/hosts/${hostID}/settings`,
      });
    });
    const startExecutionButton = screen.getByText('Start Execution');
    expect(startExecutionButton).toBeEnabled();
  });
});
