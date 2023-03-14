import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MockAdapter from 'axios-mock-adapter';

import {
  withState,
  defaultInitialState,
  renderWithRouterMatch,
} from '@lib/test-utils';
import { hostFactory } from '@lib/test-utils/factories';
import { networkClient } from '@lib/network';

import HostDetails from './HostDetails';

// delayResponse is need to avoid component updates on axios requests
const axiosMock = new MockAdapter(networkClient, { delayResponse: 2000 });

describe('HostDetails component', () => {
  beforeEach(() => {
    axiosMock.reset();
  });

  it('should not show any warning message if the agent version is correct', () => {
    const hosts = hostFactory.buildList(1, { agent_version: '2.0.0' });
    const { id: hostID } = hosts[0];
    const state = {
      ...defaultInitialState,
      hostsList: {
        hosts,
      },
    };
    const [StatefulHostDetails] = withState(<HostDetails />, state);

    renderWithRouterMatch(StatefulHostDetails, {
      path: '/hosts/:hostID',
      route: `/hosts/${hostID}`,
    });

    expect(
      screen.queryByText(
        'Agent version 2.0.0 or greater is required for new checks engine.'
      )
    ).not.toBeInTheDocument();
  });

  it('should show 2.0.0 version required warning message', () => {
    const hosts = hostFactory.buildList(1, { agent_version: '1.0.0' });
    const { id: hostID } = hosts[0];
    const state = {
      ...defaultInitialState,
      hostsList: {
        hosts,
      },
    };
    const [StatefulHostDetails] = withState(<HostDetails />, state);

    renderWithRouterMatch(StatefulHostDetails, {
      path: '/hosts/:hostID',
      route: `/hosts/${hostID}`,
    });

    expect(
      screen.getByText(
        'Agent version 2.0.0 or greater is required for new checks engine.'
      )
    ).toBeInTheDocument();
  });
});
