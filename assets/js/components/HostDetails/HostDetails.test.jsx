import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'intersection-observer';
import '@testing-library/jest-dom';
import MockAdapter from 'axios-mock-adapter';

import {
  withState,
  defaultInitialState,
  renderWithRouterMatch,
} from '@lib/test-utils';
import { hostFactory } from '@lib/test-utils/factories';
import { networkClient } from '@lib/network';

import { DEREGISTER_HOST } from '@state/hosts';
import HostDetails from './HostDetails';

// delayResponse is need to avoid component updates on axios requests
const axiosMock = new MockAdapter(networkClient, { delayResponse: 2000 });

describe('HostDetails component', () => {
  beforeEach(() => {
    axiosMock.reset();
  });

  describe('agent version', () => {
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
          'Agent version 2.0.0 or greater is required for the new checks engine.'
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
          'Agent version 2.0.0 or greater is required for the new checks engine.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('deregistration', () => {
    it('should not display clean up button when host is not deregisterable', () => {
      const hosts = hostFactory.buildList(1, { deregisterable: false });
      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts,
        },
      };
      const [StatefulHostDetails] = withState(<HostDetails />, state);

      const { id } = hosts[0];
      renderWithRouterMatch(StatefulHostDetails, {
        path: '/hosts/:hostID',
        route: `/hosts/${id}`,
      });

      const cleanUpButton = screen.queryByRole('button', { name: 'Clean up' });
      expect(cleanUpButton).not.toBeInTheDocument();
    });

    it('should display clean up button when host is deregisterable', () => {
      const hosts = hostFactory.buildList(1, { deregisterable: true });

      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts,
        },
      };
      const [StatefulHostDetails] = withState(<HostDetails />, state);

      const { id } = hosts[0];

      renderWithRouterMatch(StatefulHostDetails, {
        path: '/hosts/:hostID',
        route: `/hosts/${id}`,
      });

      expect(
        screen.getByRole('button', { name: 'Clean up' })
      ).toBeInTheDocument();
    });

    it('should show the host in deregistering state', () => {
      const host = hostFactory.build({
        deregisterable: true,
        deregistering: true,
      });
      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts: [host],
        },
      };

      const [StatefulHostDetails] = withState(<HostDetails />, state);

      const { id } = host;

      renderWithRouterMatch(StatefulHostDetails, {
        path: '/hosts/:hostID',
        route: `/hosts/${id}`,
      });

      const cleanUpButton = screen.queryByRole('button', { name: 'Clean up' });
      expect(cleanUpButton).not.toBeInTheDocument();

      const loadingSpinner = screen.getByRole('alert', { name: 'Loading' });
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should request a deregistration when the clean up button in the modal is clicked', async () => {
      const user = userEvent.setup();
      const host = hostFactory.build({ deregisterable: true });
      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts: [host],
        },
      };

      const [StatefulHostDetails, store] = withState(<HostDetails />, state);

      const { id, hostname } = host;

      renderWithRouterMatch(StatefulHostDetails, {
        path: '/hosts/:hostID',
        route: `/hosts/${id}`,
      });

      const cleanUpButton = screen.getByRole('button', { name: 'Clean up' });
      await user.click(cleanUpButton);

      expect(
        screen.getByText(
          `Clean up data discovered by agent on host ${hostname}`
        )
      ).toBeInTheDocument();

      const cleanUpModalButton = screen.getAllByRole('button', {
        name: 'Clean up',
      })[1];
      await user.click(cleanUpModalButton);

      const actions = store.getActions();
      const expectedActions = [
        {
          type: DEREGISTER_HOST,
          payload: expect.objectContaining({ id, hostname }),
        },
      ];
      expect(actions).toEqual(expect.arrayContaining(expectedActions));
    });
  });
});
