// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { checksScheduleFactory } from '@lib/test-utils/factories/checksSchedules';

import checksSchedulesReducer, {
  startLoadingChecksSchedule,
  setChecksSchedule,
  checksScheduleRefreshed,
  setChecksScheduleErrors,
  setEditingChecksSchedule,
  setChecksScheduleNetworkError,
} from './checksSchedules';

const target = { targetType: 'host', targetID: 'host-1' };

const entry = {
  loading: false,
  data: null,
  networkError: false,
  editing: false,
  errors: [],
};

const withEntry = (attrs) => ({
  host: { 'host-1': { ...entry, ...attrs } },
  cluster: {},
});

describe('ChecksSchedules reducer', () => {
  it('should start without schedules', () => {
    expect(checksSchedulesReducer(undefined, { type: '@@INIT' })).toEqual({
      host: {},
      cluster: {},
    });
  });

  it('should mark a schedule on loading state', () => {
    expect(
      checksSchedulesReducer(undefined, startLoadingChecksSchedule(target))
    ).toEqual(withEntry({ loading: true }));
  });

  it('should set a schedule', () => {
    const schedule = checksScheduleFactory.build();

    expect(
      checksSchedulesReducer(
        withEntry({ loading: true, networkError: true }),
        setChecksSchedule({ ...target, schedule })
      )
    ).toEqual(withEntry({ data: schedule }));
  });

  it('should store a refreshed schedule, keeping the request state', () => {
    const schedule = checksScheduleFactory.build();

    expect(
      checksSchedulesReducer(
        withEntry({ loading: true, editing: true, networkError: true }),
        checksScheduleRefreshed({ ...target, schedule })
      )
    ).toEqual(withEntry({ loading: true, editing: true, data: schedule }));
  });

  it('should set the errors of a schedule', () => {
    const errors = [{ detail: 'error' }];

    expect(
      checksSchedulesReducer(
        withEntry({ loading: true, networkError: true }),
        setChecksScheduleErrors({ ...target, errors })
      )
    ).toEqual(withEntry({ errors }));
  });

  it('should set the editing flag of a schedule', () => {
    expect(
      checksSchedulesReducer(
        withEntry({}),
        setEditingChecksSchedule({ ...target, editing: true })
      )
    ).toEqual(withEntry({ editing: true }));
  });

  it('should set the network error of a schedule', () => {
    expect(
      checksSchedulesReducer(
        withEntry({ loading: true }),
        setChecksScheduleNetworkError({ ...target, networkError: true })
      )
    ).toEqual(withEntry({ networkError: true }));
  });
});
