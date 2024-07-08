import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { activityLogsSettingsFactory } from '@lib/test-utils/factories/activityLogsSettings';

import {
  startLoadingActivityLogsSettings,
  setActivityLogsSettings,
  setActivityLogsSettingsErrors,
  setEditingActivityLogsSettings,
  setNetworkError,
} from '@state/activityLogsSettings';

import { defaultGlobalError } from '@lib/api/validationErrors';
import {
  fetchActivityLogsSettings,
  updateActivityLogsSettings,
} from './activityLogsSettings';

describe('Activity Logs Settings saga', () => {
  describe('Fetching Activity Logs Settings', () => {
    it('should successfully fetch activity logs settings', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const successfulResponse = activityLogsSettingsFactory.build();

      axiosMock.onGet('/settings/activity_log').reply(200, successfulResponse);

      const dispatched = await recordSaga(fetchActivityLogsSettings);

      expect(dispatched).toEqual([
        startLoadingActivityLogsSettings(),
        setActivityLogsSettings(successfulResponse),
      ]);
    });

    it.each([403, 404, 500, 502, 504])(
      'should put a network error flag on failed fetching',
      async (status) => {
        const axiosMock = new MockAdapter(networkClient);
        axiosMock.onGet('/settings/activity_log').reply(status);

        const dispatched = await recordSaga(fetchActivityLogsSettings);

        expect(dispatched).toEqual([
          startLoadingActivityLogsSettings(),
          setNetworkError(true),
        ]);
      }
    );
  });

  describe('Updating Activity Logs settings', () => {
    it('should successfully change activity logs settings', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const payload = activityLogsSettingsFactory.build();

      axiosMock.onPut('/settings/activity_log').reply(200, payload);

      const dispatched = await recordSaga(updateActivityLogsSettings, payload);

      expect(dispatched).toEqual([
        startLoadingActivityLogsSettings(),
        setActivityLogsSettings(payload),
        setEditingActivityLogsSettings(false),
        setActivityLogsSettingsErrors([]),
      ]);
    });

    it('should have errors on failed update', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const payload = activityLogsSettingsFactory.build();

      const errors = [
        {
          detail: "can't be blank",
          source: { pointer: '/retention_time/value' },
          title: 'Invalid value',
        },
      ];

      axiosMock.onPut('/settings/activity_log', payload).reply(422, {
        errors,
      });

      const dispatched = await recordSaga(updateActivityLogsSettings, {
        payload,
      });

      expect(dispatched).toEqual([
        startLoadingActivityLogsSettings(),
        setActivityLogsSettingsErrors(errors),
      ]);
    });

    it('should have generic errors on update (receiving empty body)', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const payload = activityLogsSettingsFactory.build();

      axiosMock.onPut('/settings/activity_log', payload).reply(500);

      const dispatched = await recordSaga(updateActivityLogsSettings, {
        payload,
      });

      expect(dispatched).toEqual([
        startLoadingActivityLogsSettings(),
        setActivityLogsSettingsErrors([defaultGlobalError]),
      ]);
    });

    it('should have generic errors on update', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const payload = activityLogsSettingsFactory.build();

      axiosMock.onPut('/settings/activity_log', payload).reply(500, {
        errors: [
          { title: 'Internal Server Error', detail: 'Something went wrong.' },
        ],
      });

      const dispatched = await recordSaga(updateActivityLogsSettings, {
        payload,
      });

      expect(dispatched).toEqual([
        startLoadingActivityLogsSettings(),
        setActivityLogsSettingsErrors([
          { title: 'Internal Server Error', detail: 'Something went wrong.' },
        ]),
      ]);
    });

    it.each([403, 404, 500, 502, 504])(
      'should put a network error flag on failed saving',
      async (status) => {
        const axiosMock = new MockAdapter(networkClient);
        axiosMock.onPut('/settings/activity_log').reply(status);

        const payload = activityLogsSettingsFactory.build();

        const dispatched = await recordSaga(updateActivityLogsSettings, {
          payload,
        });

        expect(dispatched).toEqual([
          startLoadingActivityLogsSettings(),
          setActivityLogsSettingsErrors([defaultGlobalError]),
        ]);
      }
    );
  });
});
