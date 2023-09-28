import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  renderWithRouterMatch,
  withState,
  defaultInitialState,
} from '@lib/test-utils';
import { hostFactory } from '@lib/test-utils/factories';

import SaptuneDetailsPage from './SaptuneDetailsPage';

describe('SaptuneDetailsPage', () => {
  it('should render not found as the host is miissing', () => {
    const hosts = hostFactory.buildList(2);
    const hostID = 'NonExistingUUID';
    const initialState = {
      ...defaultInitialState,
      hostsList: {
        hosts: [hosts],
      },
    };

    const [StatefulSaptuneDetailsPage] = withState(
      <SaptuneDetailsPage />,
      initialState
    );

    renderWithRouterMatch(StatefulSaptuneDetailsPage, {
      path: 'hosts/:hostID/saptune',
      route: `/hosts/${hostID}/saptune`,
    });

    expect(screen.getByText('Not Found')).toBeTruthy();
  });

  it('should render saptune details not found', () => {
    const host = hostFactory.build({ saptune_status: null });
    const { id: hostID } = host;
    const initialState = {
      ...defaultInitialState,
      hostsList: {
        hosts: [host],
      },
    };

    const [StatefulSaptuneDetailsPage] = withState(
      <SaptuneDetailsPage />,
      initialState
    );

    renderWithRouterMatch(StatefulSaptuneDetailsPage, {
      path: 'hosts/:hostID/saptune',
      route: `/hosts/${hostID}/saptune`,
    });

    expect(screen.getByText('Saptune Details Not Found')).toBeTruthy();
  });

  it('should render the SaptuneDetailsPage', () => {
    const host = hostFactory.build({ package_version: 3.1 });
    const { id: hostID } = host;
    const initialState = {
      ...defaultInitialState,
      hostsList: {
        hosts: [host],
      },
    };

    const [StatefulSaptuneDetailsPage] = withState(
      <SaptuneDetailsPage />,
      initialState
    );
    renderWithRouterMatch(StatefulSaptuneDetailsPage, {
      path: 'hosts/:hostID/saptune',
      route: `/hosts/${hostID}/saptune`,
    });
    expect(screen.getByText('Saptune Details:')).toBeTruthy();
  });
});
