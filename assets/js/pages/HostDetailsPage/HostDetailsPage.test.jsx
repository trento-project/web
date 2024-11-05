import React from 'react';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import {
  renderWithRouterMatch,
  defaultInitialState,
  withState,
} from '@lib/test-utils';
import { hostFactory } from '@lib/test-utils/factories';

import HostDetailsPage from '.';

const axiosMock = new MockAdapter(networkClient);

describe('HostDetailsPage', () => {
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onGet(/\/api\/v1\/charts.*/gm).reply(200, {});
    axiosMock.onGet(/\/api\/v1\/hosts.*/gm).reply(200, {});
  });

  it('Renders SUSE Manager unknown status', async () => {
    const user = userEvent.setup();

    const host = hostFactory.build();
    const { id: hostID } = host;

    const state = {
      ...defaultInitialState,
      hostsList: {
        hosts: [host],
      },
      lastExecutions: { data: null, loading: false, errors: null },
      softwareUpdates: {
        settingsConfigured: true,
        softwareUpdates: {
          [hostID]: {
            loading: false,
            errors: [{ detail: 'Generic error' }],
          },
        },
      },
    };

    const [StatefulHostDetails] = withState(<HostDetailsPage />, state);

    await act(async () =>
      renderWithRouterMatch(StatefulHostDetails, {
        path: 'hosts/:hostID',
        route: `/hosts/${hostID}`,
      })
    );

    const relevantPatchesElement = screen
      .getByText(/Relevant Patches/)
      .closest('div');
    const upgradablePackagesElement = screen
      .getByText(/Upgradable Packages/)
      .closest('div');

    expect(relevantPatchesElement).toHaveTextContent(
      'Relevant Patches Unknown'
    );
    expect(upgradablePackagesElement).toHaveTextContent(
      'Upgradable Packages Unknown'
    );

    await user.hover(relevantPatchesElement);
    expect(
      screen.queryByText('Trento was not able to retrieve the requested data.')
    ).toBeVisible();
  });

  it('Renders SUSE Manager error for host not found', async () => {
    const user = userEvent.setup();

    const host = hostFactory.build();
    const { id: hostID } = host;

    const state = {
      ...defaultInitialState,
      hostsList: {
        hosts: [host],
      },
      lastExecutions: { data: null, loading: false, errors: null },
      softwareUpdates: {
        settingsConfigured: true,
        softwareUpdates: {
          [hostID]: {
            loading: false,
            errors: [{ detail: 'The requested resource cannot be found.' }],
          },
        },
      },
    };

    const [StatefulHostDetails] = withState(<HostDetailsPage />, state);

    await act(async () =>
      renderWithRouterMatch(StatefulHostDetails, {
        path: 'hosts/:hostID',
        route: `/hosts/${hostID}`,
      })
    );

    const relevantPatchesElement = screen
      .getByText(/Relevant Patches/)
      .closest('div');
    const upgradablePackagesElement = screen
      .getByText(/Upgradable Packages/)
      .closest('div');

    expect(relevantPatchesElement).toHaveTextContent(
      'Relevant Patches Host not found in SUSE Manager'
    );
    expect(upgradablePackagesElement).toHaveTextContent(
      'Upgradable Packages Host not found in SUSE Manager'
    );

    await user.hover(relevantPatchesElement);
    expect(
      screen.queryByText(
        'Contact your SUSE Manager admin to ensure the host is managed by SUSE Manager'
      )
    ).toBeVisible();
  });

  it('Renders SUSE Manager error for connection not working', async () => {
    const user = userEvent.setup();

    const host = hostFactory.build();
    const { id: hostID } = host;

    const state = {
      ...defaultInitialState,
      hostsList: {
        hosts: [host],
      },
      lastExecutions: { data: null, loading: false, errors: null },
      softwareUpdates: {
        settingsConfigured: true,
        softwareUpdates: {
          [hostID]: {
            loading: false,
            errors: [{ detail: 'Something went wrong.' }],
          },
        },
      },
    };

    const [StatefulHostDetails] = withState(<HostDetailsPage />, state);

    await act(async () =>
      renderWithRouterMatch(StatefulHostDetails, {
        path: 'hosts/:hostID',
        route: `/hosts/${hostID}`,
      })
    );

    const relevantPatchesElement = screen
      .getByText(/Relevant Patches/)
      .closest('div');
    const upgradablePackagesElement = screen
      .getByText(/Upgradable Packages/)
      .closest('div');

    expect(relevantPatchesElement).toHaveTextContent(
      'Relevant Patches Connection to SUMA not working'
    );
    expect(upgradablePackagesElement).toHaveTextContent(
      'Upgradable Packages Connection to SUMA not working'
    );

    await user.hover(relevantPatchesElement);
    expect(
      screen.queryByText('Please review SUSE Manager settings')
    ).toBeVisible();
  });
});
