// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';

import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  withState,
  defaultInitialState as defaultInitialStateBase,
  renderWithRouter,
} from '@lib/test-utils';
import { softwareUpdatesSettingsFactory } from '@lib/test-utils/factories/softwareUpdatesSettings';
import { networkClient } from '@lib/network';
import { formatDateOnly } from '@lib/timezones';
import MockAdapter from 'axios-mock-adapter';

import {
  fetchChecksFrequencySettings,
  updateChecksFrequencySettings,
  setEditingChecksFrequencySettings,
  setChecksFrequencySettingsErrors,
} from '@state/checksFrequencySettings';

import SettingsPage from './SettingsPage';
import {
  alertingSettingsFactory,
  alertingSettingsToApiData,
} from '../../lib/test-utils/factories/alertingSettings';

const axiosMock = new MockAdapter(networkClient);

const defaultInitialState = {
  ...defaultInitialStateBase,
  activityLogsSettings: {
    settings: {
      retention_time: { value: 1, unit: 'day' },
    },
  },
  checksFrequencySettings: {
    loading: false,
    settings: {
      enabled: true,
      frequency: { value: 5, unit: 'minute' },
      enforced_from_env: false,
    },
    errors: [],
    editing: false,
    networkError: false,
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

    it('should render api key expiration date according to user timezone', async () => {
      const futureDate = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();

      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
        user: {
          abilities: defaultInitialStateBase.user.abilities,
          timezone: 'Pacific/Kiritimati',
        },
      });

      axiosMock.onGet('/api/v1/settings/api_key').reply(200, {
        expire_at: futureDate,
        generated_api_key: 'api_key_with_expiration',
      });

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      const expectedDate = formatDateOnly(futureDate, 'Pacific/Kiritimati');
      expect(screen.getByText(`Key will expire ${expectedDate}`)).toBeVisible();
    });
  });

  describe('Software Updates Section', () => {
    it('should render a loading box while fetching settings', async () => {
      axiosMock.onGet('/api/v1/settings/smlm').reply(
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
        screen.getByText('Loading SUSE Multi-Linux Manager Settings...')
      ).toBeVisible();
    });

    it('should render an empty SUSE Multi-Linux Manager Config Section', async () => {
      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
      });

      axiosMock.onGet('/api/v1/settings/smlm').reply(404, {});

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      expect(screen.getByText('SUSE Multi-Linux Manager URL')).toBeVisible();
      expect(screen.getByText('https://')).toBeVisible();

      expect(screen.getByText('CA Certificate')).toBeVisible();
      expect(screen.getByText('-')).toBeVisible();

      const smlmUsername = screen.getByLabelText('smlm-username');
      expect(smlmUsername).toBeVisible();
      expect(smlmUsername).toHaveTextContent('.....');

      const smlmPassword = screen.getByLabelText('smlm-password');
      expect(smlmPassword).toBeVisible();
      expect(smlmPassword).toHaveTextContent('.....');
    });

    it('should render SUSE Multi-Linux Manager Config Section with configured settings', async () => {
      const settings = softwareUpdatesSettingsFactory.build();

      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
      });

      axiosMock.onGet('/api/v1/settings/smlm').reply(200, settings);

      const { url, username, ca_uploaded_at } = settings;

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });
      expect(screen.getByText('SUSE Multi-Linux Manager URL')).toBeVisible();
      expect(screen.getByText(url)).toBeVisible();

      expect(screen.getByText('CA Certificate')).toBeVisible();
      expect(screen.getByText('Certificate Uploaded')).toBeVisible();

      const expectedDate = formatDateOnly(ca_uploaded_at);
      expect(screen.getByText(`Uploaded: ${expectedDate}`)).toBeVisible();

      const smlmUsername = screen.getByLabelText('smlm-username');
      expect(smlmUsername).toBeVisible();
      expect(smlmUsername).toHaveTextContent(username);

      const smlmPassword = screen.getByLabelText('smlm-password');
      expect(smlmPassword).toBeVisible();
      expect(smlmPassword).toHaveTextContent('•••••');
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

  describe('Check Executions Section', () => {
    const renderWithChecksFrequencySettings = async (
      checksFrequencySettings = {},
      user = defaultInitialState.user
    ) => {
      const [StatefulSettings, store] = withState(<SettingsPage />, {
        ...defaultInitialState,
        user,
        checksFrequencySettings: {
          ...defaultInitialState.checksFrequencySettings,
          ...checksFrequencySettings,
        },
      });

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      return store;
    };

    it('should fetch the checks frequency settings', async () => {
      const store = await renderWithChecksFrequencySettings();

      expect(store.getActions()).toContainEqual(fetchChecksFrequencySettings());
    });

    it('should render the check executions section', async () => {
      await renderWithChecksFrequencySettings({
        settings: {
          enabled: true,
          frequency: { value: 6, unit: 'hour' },
          enforced_from_env: false,
        },
      });

      expect(screen.getByText('Check Executions')).toBeVisible();
      expect(screen.getByLabelText('checks-frequency')).toHaveTextContent(
        'Every 6 hours'
      );
      expect(
        screen.getByLabelText('checks-frequency-edit-button')
      ).toBeEnabled();
    });

    it('should render the disabled periodic checks', async () => {
      await renderWithChecksFrequencySettings({
        settings: {
          enabled: false,
          frequency: { value: 6, unit: 'hour' },
          enforced_from_env: false,
        },
      });

      expect(screen.getByLabelText('checks-frequency')).toHaveTextContent(
        'Disabled'
      );
    });

    it('should render loader on check executions section', async () => {
      await renderWithChecksFrequencySettings({ loading: true });

      expect(
        screen.getByText('Loading Check Executions Settings...')
      ).toBeVisible();
    });

    it('should reload the checks frequency settings after a network error', async () => {
      const user = userEvent.setup();
      const store = await renderWithChecksFrequencySettings({
        networkError: true,
      });

      expect(
        screen.getByText(
          'Unable to load Check Executions Settings. Please try reloading this section.'
        )
      ).toBeVisible();

      store.clearActions();
      await user.click(screen.getByRole('button', { name: 'Reload' }));

      expect(store.getActions()).toContainEqual(fetchChecksFrequencySettings());
    });

    it('should show the frequency enforced from env without allowing to change it', async () => {
      await renderWithChecksFrequencySettings({
        settings: {
          frequency: { value: 2, unit: 'week' },
          enforced_from_env: true,
        },
      });

      expect(screen.getByLabelText('checks-frequency')).toHaveTextContent(
        'Every 2 weeks'
      );
      expect(
        screen.getByLabelText('checks-frequency-edit-button')
      ).toBeDisabled();
    });

    it('should start editing when clicking on the edit button', async () => {
      const user = userEvent.setup();
      const store = await renderWithChecksFrequencySettings();

      await user.click(screen.getByLabelText('checks-frequency-edit-button'));

      expect(store.getActions()).toContainEqual(
        setEditingChecksFrequencySettings(true)
      );
    });

    it('should render edit modal and save the settings', async () => {
      const user = userEvent.setup();
      const store = await renderWithChecksFrequencySettings({
        editing: true,
        settings: {
          enabled: false,
          frequency: { value: 12, unit: 'hour' },
          enforced_from_env: false,
        },
      });

      const modal = screen.getByRole('dialog');
      expect(
        within(modal).getByText('Check Executions Settings')
      ).toBeVisible();
      expect(
        within(modal).getByLabelText('checks-frequency-enabled')
      ).not.toBeChecked();
      expect(within(modal).getByText('12')).toBeVisible();
      expect(within(modal).getByText('Hours')).toBeVisible();

      await user.click(
        within(modal).getByRole('button', { name: 'Save Settings' })
      );

      expect(store.getActions()).toContainEqual(
        updateChecksFrequencySettings({
          enabled: false,
          frequency: { value: 12, unit: 'hour' },
        })
      );
    });

    it('should clear errors and stop editing on close', async () => {
      const user = userEvent.setup();
      const store = await renderWithChecksFrequencySettings({ editing: true });

      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: 'Close',
        })
      );

      expect(store.getActions()).toEqual(
        expect.arrayContaining([
          setChecksFrequencySettingsErrors([]),
          setEditingChecksFrequencySettings(false),
        ])
      );
    });

    it('should clear the saving errors when the frequency changes', async () => {
      const user = userEvent.setup();
      const store = await renderWithChecksFrequencySettings({
        editing: true,
        errors: [
          {
            detail: 'must be one of 5, 15, 30 when the unit is minute',
            source: { pointer: '/frequency/value' },
            title: 'Invalid value',
          },
        ],
      });

      store.clearActions();
      await user.click(screen.getByLabelText('checks-frequency-unit'));
      await user.click(screen.getByRole('option', { name: 'Hours' }));

      expect(store.getActions()).toEqual([
        setChecksFrequencySettingsErrors([]),
      ]);
    });

    it('should render saving errors', async () => {
      await renderWithChecksFrequencySettings({
        editing: true,
        errors: [
          {
            title: 'Conflict has occurred',
            detail:
              'Checks frequency settings can not be set, enforced by ENV.',
          },
        ],
      });

      expect(
        screen.getByText(
          'Checks frequency settings can not be set, enforced by ENV.'
        )
      ).toBeVisible();
    });
  });

  describe('Alerting Section', () => {
    it('renders a loading box while fetching settings', async () => {
      axiosMock.onGet('/api/v1/settings/alerting').reply(
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

      expect(screen.getByText('Loading Alerting Settings...')).toBeVisible();
    });

    it('renders a default Alerting Config Section when initial fetch returns 404', async () => {
      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
      });

      axiosMock.onGet('/api/v1/settings/alerting').reply(404, {});

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      expect(screen.getByLabelText('smtp-server')).toHaveTextContent(
        'https://...'
      );
      expect(screen.getByLabelText('smtp-port')).toHaveTextContent('587');
      expect(screen.getByLabelText('smtp-username')).toHaveTextContent('...');
      expect(screen.getByLabelText('smtp-password')).toHaveTextContent('•••••');
      expect(screen.getByLabelText('alerting-sender')).toHaveTextContent(
        '...@...'
      );
      expect(screen.getByLabelText('alerting-recipient')).toHaveTextContent(
        '...@...'
      );
      expect(screen.getByLabelText('alerting-enabled')).toHaveTextContent(
        'Disabled'
      );
    });

    it('renders Alerting Config Section on successful initial fetch', async () => {
      const alertingSettings = alertingSettingsFactory.build();
      const {
        smtpServer,
        smtpPort,
        smtpUsername,
        senderEmail,
        recipientEmail,
      } = alertingSettings;

      const [StatefulSettings] = withState(<SettingsPage />, {
        ...defaultInitialState,
      });

      axiosMock
        .onGet('/api/v1/settings/alerting')
        .reply(200, alertingSettingsToApiData(alertingSettings));

      await act(async () => {
        renderWithRouter(StatefulSettings);
      });

      expect(screen.getByLabelText('smtp-server')).toHaveTextContent(
        smtpServer
      );
      expect(screen.getByLabelText('smtp-port')).toHaveTextContent(
        smtpPort.toString()
      );
      expect(screen.getByLabelText('smtp-username')).toHaveTextContent(
        smtpUsername
      );
      expect(screen.getByLabelText('smtp-password')).toHaveTextContent('•••••');
      expect(screen.getByLabelText('alerting-sender')).toHaveTextContent(
        senderEmail
      );
      expect(screen.getByLabelText('alerting-recipient')).toHaveTextContent(
        recipientEmail
      );
      expect(screen.getByLabelText('alerting-enabled')).toHaveTextContent(
        'Enabled'
      );
    });
  });
});
