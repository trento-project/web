// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import MockAdapter from 'axios-mock-adapter';
import { act, renderHook, waitFor } from '@testing-library/react';

import { networkClient } from '@lib/network';
import { hookWrapperWithState } from '@lib/test-utils';

import useOperationSchedules from './useOperationSchedules';

const axiosMock = new MockAdapter(networkClient);
const schedule = { id: 'schedule-id', operation: 'reboot' };

describe('useOperationSchedules', () => {
  afterEach(() => axiosMock.reset());

  it('should list, change and cancel the schedules of a target', async () => {
    axiosMock
      .onGet('/api/v1/operation_schedules', {
        params: { target_id: 'host-id' },
      })
      .reply(200, [schedule]);
    axiosMock
      .onPut('/api/v1/operation_schedules/schedule-id')
      .reply(200, { ...schedule, warnings: [] });
    axiosMock.onDelete('/api/v1/operation_schedules/schedule-id').reply(204);

    const [wrapper, store] = hookWrapperWithState();
    const { result } = renderHook(() => useOperationSchedules('host-id'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.schedules).toEqual([schedule]));

    const change = {
      params: {},
      starts_at: '2026-11-21T04:00:00.000Z',
      timezone: 'Etc/UTC',
      recurrence: null,
    };
    await act(() => result.current.updateSchedule('schedule-id', change));
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual(change);

    await act(() => result.current.cancelSchedule('schedule-id'));
    expect(axiosMock.history.delete).toHaveLength(1);

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        {
          type: 'NOTIFICATION',
          payload: expect.objectContaining({ text: 'Schedule changed' }),
        },
        {
          type: 'NOTIFICATION',
          payload: expect.objectContaining({ text: 'Schedule cancelled' }),
        },
      ])
    );
    expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(3);
  });
});
