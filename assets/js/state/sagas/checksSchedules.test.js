// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { waitFor } from '@testing-library/react';

import { recordSaga } from '@lib/test-utils';
import { createStore } from '@state';

import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { checksScheduleFactory } from '@lib/test-utils/factories/checksSchedules';
import { checksFrequencySettingsFactory } from '@lib/test-utils/factories/checksFrequencySettings';
import { defaultGlobalError } from '@lib/api/validationErrors';
import { checksFrequencySettingsUpdated } from '@state/checksFrequencySettings';

import {
  fetchChecksSchedule as fetchChecksScheduleAction,
  updateChecksSchedule as updateChecksScheduleAction,
  refreshChecksSchedules as refreshChecksSchedulesAction,
  startLoadingChecksSchedule,
  setChecksSchedule,
  checksScheduleRefreshed,
  setChecksScheduleErrors,
  setEditingChecksSchedule,
  setChecksScheduleNetworkError,
} from '@state/checksSchedules';

import {
  fetchChecksSchedule,
  updateChecksSchedule,
  refreshChecksSchedules,
  refreshAllChecksSchedules,
} from './checksSchedules';

const axiosMock = new MockAdapter(networkClient);

const host = { targetType: 'host', targetID: 'host-1' };
const cluster = { targetType: 'cluster', targetID: 'cluster-1' };

const loadedState = (targets) => ({
  checksSchedules: targets.reduce(
    (acc, { targetType, targetID }) => ({
      ...acc,
      [targetType]: { ...acc[targetType], [targetID]: { data: {} } },
    }),
    { host: {}, cluster: {} }
  ),
});

describe('Checks schedules saga', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe('fetching a schedule', () => {
    it.each([
      [host, '/hosts/host-1/checks/schedule'],
      [cluster, '/clusters/cluster-1/checks/schedule'],
    ])('should fetch the schedule of a %o', async (target, url) => {
      const schedule = checksScheduleFactory.build();
      axiosMock.onGet(url).reply(200, schedule);

      const dispatched = await recordSaga(
        fetchChecksSchedule,
        fetchChecksScheduleAction(target)
      );

      expect(dispatched).toEqual([
        startLoadingChecksSchedule(target),
        setChecksSchedule({ ...target, schedule }),
      ]);
    });

    it.each([404, 500])(
      'should put a network error flag on failed fetching (%s)',
      async (status) => {
        axiosMock.onGet('/hosts/host-1/checks/schedule').reply(status);

        const dispatched = await recordSaga(
          fetchChecksSchedule,
          fetchChecksScheduleAction(host)
        );

        expect(dispatched).toEqual([
          startLoadingChecksSchedule(host),
          setChecksScheduleNetworkError({ ...host, networkError: true }),
        ]);
      }
    );
  });

  describe('updating a schedule', () => {
    it('should store the own schedule of a target', async () => {
      const schedule = { enabled: true, frequency: { value: 6, unit: 'hour' } };
      const response = { ...schedule, global: false, next_execution_at: null };

      axiosMock
        .onPut('/hosts/host-1/checks/schedule', schedule)
        .reply(200, response);

      const dispatched = await recordSaga(
        updateChecksSchedule,
        updateChecksScheduleAction({ ...host, schedule })
      );

      expect(dispatched).toEqual([
        startLoadingChecksSchedule(host),
        setChecksSchedule({ ...host, schedule: response }),
        setEditingChecksSchedule({ ...host, editing: false }),
        setChecksScheduleErrors({ ...host, errors: [] }),
      ]);
    });

    it('should delete the own schedule of a target, and fetch the global one', async () => {
      const response = checksScheduleFactory.build({ global: true });

      axiosMock.onDelete('/clusters/cluster-1/checks/schedule').reply(204);
      axiosMock
        .onGet('/clusters/cluster-1/checks/schedule')
        .reply(() =>
          axiosMock.history.delete.length === 1 ? [200, response] : [500]
        );

      const dispatched = await recordSaga(
        updateChecksSchedule,
        updateChecksScheduleAction({ ...cluster, schedule: null })
      );

      expect(dispatched).toEqual([
        startLoadingChecksSchedule(cluster),
        setChecksSchedule({ ...cluster, schedule: response }),
        setEditingChecksSchedule({ ...cluster, editing: false }),
        setChecksScheduleErrors({ ...cluster, errors: [] }),
      ]);
      expect(axiosMock.history.delete).toHaveLength(1);
    });

    it('should set the errors of a refused schedule', async () => {
      const errors = [
        {
          detail: 'must be one of 1, 6, 12, 24',
          source: { pointer: '/frequency/value' },
        },
      ];

      axiosMock.onPut('/hosts/host-1/checks/schedule').reply(422, { errors });

      const dispatched = await recordSaga(
        updateChecksSchedule,
        updateChecksScheduleAction({
          ...host,
          schedule: { enabled: true, frequency: { value: 2, unit: 'hour' } },
        })
      );

      expect(dispatched).toEqual([
        startLoadingChecksSchedule(host),
        setChecksScheduleErrors({ ...host, errors }),
      ]);
    });

    it('should set a global error when the change fails without details', async () => {
      axiosMock.onDelete('/hosts/host-1/checks/schedule').reply(500);

      const dispatched = await recordSaga(
        updateChecksSchedule,
        updateChecksScheduleAction({ ...host, schedule: null })
      );

      expect(dispatched).toEqual([
        startLoadingChecksSchedule(host),
        setChecksScheduleErrors({ ...host, errors: [defaultGlobalError] }),
      ]);
      expect(axiosMock.history.get).toHaveLength(0);
    });

    it('should close the editing and flag the schedule when it cannot be read back after a deletion', async () => {
      axiosMock.onDelete('/hosts/host-1/checks/schedule').reply(204);
      axiosMock.onGet('/hosts/host-1/checks/schedule').reply(503);

      const dispatched = await recordSaga(
        updateChecksSchedule,
        updateChecksScheduleAction({ ...host, schedule: null })
      );

      expect(dispatched).toEqual([
        startLoadingChecksSchedule(host),
        setEditingChecksSchedule({ ...host, editing: false }),
        setChecksScheduleErrors({ ...host, errors: [] }),
        setChecksScheduleNetworkError({ ...host, networkError: true }),
      ]);
    });

    it('should not delete the own schedule without an explicit null', async () => {
      const errors = [
        { detail: 'Missing field: enabled', source: { pointer: '/enabled' } },
      ];
      axiosMock.onPut('/hosts/host-1/checks/schedule').reply(422, { errors });

      const dispatched = await recordSaga(
        updateChecksSchedule,
        updateChecksScheduleAction(host)
      );

      expect(dispatched).toEqual([
        startLoadingChecksSchedule(host),
        setChecksScheduleErrors({ ...host, errors }),
      ]);
      expect(axiosMock.history.delete).toHaveLength(0);
    });
  });

  describe('refreshing the schedules', () => {
    it('should refresh the schedule of a loaded target', async () => {
      const schedule = checksScheduleFactory.build();
      axiosMock.onGet('/hosts/host-1/checks/schedule').reply(200, schedule);

      const dispatched = await recordSaga(
        refreshChecksSchedules,
        refreshChecksSchedulesAction(host),
        loadedState([host])
      );

      expect(dispatched).toEqual([
        checksScheduleRefreshed({ ...host, schedule }),
      ]);
    });

    it('should not refresh a target that is not loaded', async () => {
      const dispatched = await recordSaga(
        refreshChecksSchedules,
        refreshChecksSchedulesAction(host),
        loadedState([])
      );

      expect(dispatched).toEqual([]);
      expect(axiosMock.history.get).toHaveLength(0);
    });

    it('should refresh only the given target', async () => {
      const schedule = checksScheduleFactory.build();
      axiosMock.onGet('/hosts/host-1/checks/schedule').reply(200, schedule);

      const dispatched = await recordSaga(
        refreshChecksSchedules,
        refreshChecksSchedulesAction(host),
        loadedState([
          host,
          { targetType: 'host', targetID: 'host-2' },
          { targetType: 'cluster', targetID: 'host-1' },
        ])
      );

      expect(dispatched).toEqual([
        checksScheduleRefreshed({ ...host, schedule }),
      ]);
      expect(axiosMock.history.get).toHaveLength(1);
    });

    it('should refresh all the loaded targets when the global settings change', async () => {
      const hostSchedule = checksScheduleFactory.build();
      const clusterSchedule = checksScheduleFactory.build();
      axiosMock.onGet('/hosts/host-1/checks/schedule').reply(200, hostSchedule);
      axiosMock
        .onGet('/clusters/cluster-1/checks/schedule')
        .reply(200, clusterSchedule);

      const dispatched = await recordSaga(
        refreshAllChecksSchedules,
        checksFrequencySettingsUpdated(checksFrequencySettingsFactory.build()),
        loadedState([host, cluster])
      );

      expect(dispatched).toEqual(
        expect.arrayContaining([
          checksScheduleRefreshed({ ...host, schedule: hostSchedule }),
          checksScheduleRefreshed({ ...cluster, schedule: clusterSchedule }),
        ])
      );
      expect(dispatched).toHaveLength(2);
    });

    it('should keep the schedule on display when a refresh fails', async () => {
      const clusterSchedule = checksScheduleFactory.build();
      axiosMock.onGet('/hosts/host-1/checks/schedule').reply(500);
      axiosMock
        .onGet('/clusters/cluster-1/checks/schedule')
        .reply(200, clusterSchedule);

      const dispatched = await recordSaga(
        refreshAllChecksSchedules,
        checksFrequencySettingsUpdated(checksFrequencySettingsFactory.build()),
        loadedState([host, cluster])
      );

      expect(dispatched).toEqual([
        checksScheduleRefreshed({ ...cluster, schedule: clusterSchedule }),
      ]);
    });
  });

  describe('Application store', () => {
    it('should refresh a loaded schedule when the global settings change', async () => {
      const previous = checksScheduleFactory.build({ global: true });
      const refreshed = checksScheduleFactory.build({ global: true });
      const store = createStore(undefined, {
        checksSchedules: {
          host: {
            'host-1': {
              loading: true,
              data: previous,
              networkError: false,
              editing: true,
              errors: [],
            },
          },
          cluster: {},
        },
      });

      axiosMock.onGet('/hosts/host-1/checks/schedule').reply(200, refreshed);

      store.dispatch(
        checksFrequencySettingsUpdated(checksFrequencySettingsFactory.build())
      );

      await waitFor(() =>
        expect(store.getState().checksSchedules.host['host-1']).toEqual({
          loading: true,
          data: refreshed,
          networkError: false,
          editing: true,
          errors: [],
        })
      );
    });
  });
});
