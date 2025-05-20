import React from 'react';

import { format } from 'date-fns';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  withState,
  defaultInitialState as defaultInitialStateBase,
  renderWithRouter,
} from '@lib/test-utils';
import { softwareUpdatesSettingsFactory } from '@lib/test-utils/factories/softwareUpdatesSettings';
import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import SettingsPage from './SettingsPage';

const axiosMock = new MockAdapter(networkClient);

const defaultInitialState = {
  ...defaultInitialStateBase,
  activityLogsSettings: {
    settings: {
      retention_time: { value: 1, unit: 'day' },
    },
  },
};

describe('Settings Page', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  beforeEach(() => {
    axiosMock.onGet('/api/v1/settings/api_key').reply(200, {
      expire_at: null,
      generated_api_key: 'api_key',
    });
  });

  describe('API Key Section', () => {
    it('should render the api key with copy button', async () => {
      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
        softwareUpdatesSettings: {
          loading: true,
          settings: {
            url: undefined,
            username: undefined,
            ca_uploaded_at: undefined,
          },
        },
      });

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      expect(screen.getByText('Key will never expire')).toBeVisible();
      expect(screen.getByText('api_key')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'copy to clipboard' })
      ).toBeVisible();
    });
  });

  describe('Software Updates Section', () => {
    it('should render a loading box while fetching settings', async () => {
      axiosMock.onGet('/api/v1/settings/suse_manager').reply(
        (_) =>
          new Promise((resolve) => {
            setTimeout(() => resolve([200, {}]), 5000);
          })
      );

      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
      });

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      expect(
        screen.getByText('Loading SUSE Manager Settings...')
      ).toBeVisible();
    });

    it('should render an empty SUSE Manager Config Section', async () => {
      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
      });

      axiosMock.onGet('/api/v1/settings/suse_manager').reply(404, {});

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      expect(screen.getByText('SUSE Manager URL')).toBeVisible();
      expect(screen.getByText('https://')).toBeVisible();

      expect(screen.getByText('CA Certificate')).toBeVisible();
      expect(screen.getByText('-')).toBeVisible();

      const sumaUsername = screen.getByLabelText('suma-username');
      expect(sumaUsername).toBeVisible();
      expect(sumaUsername).toHaveTextContent('.....');

      const sumaPassword = screen.getByLabelText('suma-password');
      expect(sumaPassword).toBeVisible();
      expect(sumaPassword).toHaveTextContent('.....');
    });

    it('should render SUSE Manager Config Section with configured settings', async () => {
      const settings = softwareUpdatesSettingsFactory.build();

      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
      });

      axiosMock.onGet('/api/v1/settings/suse_manager').reply(200, settings);

      const { url, username, ca_uploaded_at } = settings;

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });
      expect(screen.getByText('SUSE Manager URL')).toBeVisible();
      expect(screen.getByText(url)).toBeVisible();

      expect(screen.getByText('CA Certificate')).toBeVisible();
      expect(screen.getByText('Certificate Uploaded')).toBeVisible();
      expect(
        screen.getByText(format(ca_uploaded_at, "'Uploaded:' dd MMM y"))
      ).toBeVisible();

      const sumaUsername = screen.getByLabelText('suma-username');
      expect(sumaUsername).toBeVisible();
      expect(sumaUsername).toHaveTextContent(username);

      const sumaPassword = screen.getByLabelText('suma-password');
      expect(sumaPassword).toBeVisible();
      expect(sumaPassword).toHaveTextContent('•••••');
    });
  });

  describe('Activity Logs Section', () => {
    it('should render activity logs section', async () => {
      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
        activityLogsSettings: {
          loading: false,
          settings: { retention_time: { value: 1, unit: 'day' } },
        },
      });

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      expect(screen.getByText('Activity Logs')).toBeVisible();
    });

    it('should render loader on activity logs section', async () => {
      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
        activityLogsSettings: {
          loading: true,
          settings: { retention_time: { value: 1, unit: 'day' } },
        },
      });

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      expect(
        screen.getByText('Loading Activity Logs Settings...')
      ).toBeVisible();
    });

    it('should render edit modal', async () => {
      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
        activityLogsSettings: {
          editing: true,
          settings: { retention_time: { value: 1, unit: 'day' } },
        },
      });

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      expect(screen.getByText('Enter Activity Logs Settings')).toBeVisible();

      expect(screen.getByText('1')).toBeVisible();

      expect(screen.getByText('day')).toBeVisible();

      expect(screen.getByText('Save Settings')).toBeVisible();

      expect(screen.getByText('Cancel')).toBeVisible();
    });

    it('should render saving errors', async () => {
      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
        activityLogsSettings: {
          editing: true,
          settings: { retention_time: { value: 1, unit: 'day' } },
          errors: [
            {
              detail: 'Invalid data provided',
              source: { pointer: '/retention_time/value' },
              title: 'Invalid data',
            },
          ],
        },
      });

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      expect(screen.getByText('Invalid data provided')).toBeVisible();
    });

    it('should render settings page with a disabled Generate Key button when the user has not the right permissions', async () => {
      const user = userEvent.setup();
      const userWithoutPermission = [];
      const setApiKeySettingsModalOpen = jest.fn();
      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
        user: { abilities: userWithoutPermission },
      });

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      expect(screen.getByText('Generate Key')).toBeDisabled();
      await user.click(screen.getByText('Generate Key'));
      expect(setApiKeySettingsModalOpen).not.toHaveBeenCalled();
      await user.hover(screen.getByText('Generate Key'));
      expect(
        screen.queryAllByText('You are not authorized for this action').length
      ).toBeGreaterThan(0);
      expect(
        screen.queryAllByText('You are not authorized for this action')[0]
      ).toBeVisible();
    });
  });
});
