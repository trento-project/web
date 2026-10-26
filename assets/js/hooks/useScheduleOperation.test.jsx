// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import MockAdapter from 'axios-mock-adapter';
import { act, renderHook } from '@testing-library/react';

import { networkClient } from '@lib/network';
import { hookWrapperWithState } from '@lib/test-utils';

import useScheduleOperation from './useScheduleOperation';

const axiosMock = new MockAdapter(networkClient);

const target = {
  target_type: 'cluster',
  target_id: 'cluster-id',
  operation: 'cluster_maintenance_change',
  params: { maintenance: true },
};

const schedule = {
  starts_at: '2026-11-20T03:00:00.000Z',
  timezone: 'Etc/UTC',
  recurrence: null,
};

describe('useScheduleOperation', () => {
  afterEach(() => axiosMock.reset());

  it('should create the schedule and tell when the policies do not pass now', async () => {
    axiosMock.onPost('/api/v1/operation_schedules').reply(201, {
      id: 'schedule-id',
      warnings: [
        {
          message:
            'Trento agent is not currently running in any of the hosts in the cluster {0}',
          metadata: [
            { id: 'cluster-id', label: 'hana_cluster', type: 'cluster' },
          ],
        },
      ],
    });

    const [wrapper, store] = hookWrapperWithState();
    const { result } = renderHook(() => useScheduleOperation(), { wrapper });

    await act(() => result.current(target, schedule));

    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      ...target,
      ...schedule,
    });

    expect(store.getActions()).toContainEqual({
      type: 'NOTIFICATION',
      payload: {
        text: 'Operation scheduled. It would not run now: Trento agent is not currently running in any of the hosts in the cluster hana_cluster',
        icon: '⚠️',
      },
    });
  });

  it('should tell when the schedule cannot be saved', async () => {
    axiosMock.onPost('/api/v1/operation_schedules').reply(422, {});

    const [wrapper, store] = hookWrapperWithState();
    const { result } = renderHook(() => useScheduleOperation(), { wrapper });

    await act(() => result.current(target, schedule));

    expect(store.getActions()).toContainEqual({
      type: 'NOTIFICATION',
      payload: { text: 'Unable to schedule the operation', icon: '❌' },
    });
  });
});
