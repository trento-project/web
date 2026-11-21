// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { waitFor } from '@testing-library/react';

import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { createStore } from '@state';

import { checksFrequencySettingsFactory } from '@lib/test-utils/factories/checksFrequencySettings';

import {
  fetchChecksFrequencySettings as fetchChecksFrequencySettingsAction,
  updateChecksFrequencySettings as updateChecksFrequencySettingsAction,
  startLoadingChecksFrequencySettings,
  setChecksFrequencySettings,
  setChecksFrequencySettingsErrors,
  setEditingChecksFrequencySettings,
  setChecksFrequencySettingsNetworkError,
} from '@state/checksFrequencySettings';

import { defaultGlobalError } from '@lib/api/validationErrors';
import {
  fetchChecksFrequencySettings,
  updateChecksFrequencySettings,
} from './checksFrequencySettings';

const axiosMock = new MockAdapter(networkClient);

describe('Checks Frequency Settings saga', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe('Fetching Checks Frequency Settings', () => {
    it('should successfully fetch checks frequency settings', async () => {
      const response = checksFrequencySettingsFactory.build();
      axiosMock.onGet('/settings/checks_frequency').reply(200, response);

      const dispatched = await recordSaga(fetchChecksFrequencySettings);

      expect(dispatched).toEqual([
        startLoadingChecksFrequencySettings(),
        setChecksFrequencySettings(response),
      ]);
    });

    it.each([403, 404, 500, 502, 504])(
      'should put a network error flag on failed fetching (%s)',
      async (status) => {
        axiosMock.onGet('/settings/checks_frequency').reply(status);

        const dispatched = await recordSaga(fetchChecksFrequencySettings);

        expect(dispatched).toEqual([
          startLoadingChecksFrequencySettings(),
          setChecksFrequencySettingsNetworkError(true),
        ]);
      }
    );
  });

  describe('Updating Checks Frequency Settings', () => {
    it('should successfully change the checks frequency', async () => {
      const payload = { enabled: true, frequency: { value: 6, unit: 'hour' } };
      const response = { ...payload, enforced_from_env: false };

      axiosMock
        .onPatch('/settings/checks_frequency', payload)
        .reply(200, response);

      const dispatched = await recordSaga(updateChecksFrequencySettings, {
        payload,
      });

      expect(dispatched).toEqual([
        startLoadingChecksFrequencySettings(),
        setChecksFrequencySettings(response),
        setEditingChecksFrequencySettings(false),
        setChecksFrequencySettingsErrors([]),
      ]);
    });

    it.each`
      status | errors
      ${422} | ${[{ detail: 'must be one of 1, 6, 12, 24 when the unit is hour', source: { pointer: '/frequency/value' }, title: 'Invalid value' }]}
      ${409} | ${[{ detail: 'Checks frequency settings can not be set, enforced by ENV.', title: 'Conflict has occurred' }]}
    `(
      'should keep the errors of a failed update ($status)',
      async ({ status, errors }) => {
        const payload = {
          enabled: true,
          frequency: { value: 2, unit: 'hour' },
        };

        axiosMock
          .onPatch('/settings/checks_frequency', payload)
          .reply(status, { errors });

        const dispatched = await recordSaga(updateChecksFrequencySettings, {
          payload,
        });

        expect(dispatched).toEqual([
          startLoadingChecksFrequencySettings(),
          setChecksFrequencySettingsErrors(errors),
        ]);
      }
    );

    it.each([403, 404, 500, 502, 504])(
      'should have generic errors on a failed update with an empty body (%s)',
      async (status) => {
        axiosMock.onPatch('/settings/checks_frequency').reply(status);

        const dispatched = await recordSaga(updateChecksFrequencySettings, {
          payload: { enabled: false, frequency: { value: 6, unit: 'hour' } },
        });

        expect(dispatched).toEqual([
          startLoadingChecksFrequencySettings(),
          setChecksFrequencySettingsErrors([defaultGlobalError]),
        ]);
      }
    );
  });

  describe('Application store', () => {
    it('should load and save the checks frequency through the store', async () => {
      const store = createStore(undefined, {});

      axiosMock.onGet('/settings/checks_frequency').reply(200, {
        enabled: false,
        frequency: { value: 5, unit: 'minute' },
        enforced_from_env: false,
      });

      store.dispatch(fetchChecksFrequencySettingsAction());

      await waitFor(() =>
        expect(store.getState().checksFrequencySettings).toMatchObject({
          loading: false,
          settings: {
            enabled: false,
            frequency: { value: 5, unit: 'minute' },
            enforced_from_env: false,
          },
        })
      );

      const frequency = { value: 6, unit: 'hour' };
      axiosMock
        .onPatch('/settings/checks_frequency', { enabled: true, frequency })
        .reply(200, { enabled: true, frequency, enforced_from_env: false });

      store.dispatch(
        updateChecksFrequencySettingsAction({ enabled: true, frequency })
      );

      await waitFor(() =>
        expect(store.getState().checksFrequencySettings).toMatchObject({
          loading: false,
          settings: { enabled: true, frequency, enforced_from_env: false },
        })
      );
    });
  });
});
