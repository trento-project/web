// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { getChecksSchedule } from './checksSchedules';

describe('Checks schedules selector', () => {
  it('should return a loading schedule for a target not loaded yet', () => {
    expect(
      getChecksSchedule(
        'host',
        'host-1'
      )({ checksSchedules: { host: {}, cluster: {} } })
    ).toEqual({
      loading: true,
      data: null,
      networkError: false,
      editing: false,
      errors: [],
    });
  });

  it('should return the same loading schedule on every call', () => {
    const state = { checksSchedules: { host: {}, cluster: {} } };

    expect(getChecksSchedule('host', 'host-1')(state)).toBe(
      getChecksSchedule('cluster', 'cluster-1')(state)
    );
  });

  it('should return the schedule of a loaded target', () => {
    const entry = {
      loading: false,
      data: { global: true },
      networkError: false,
      editing: false,
      errors: [],
    };

    expect(
      getChecksSchedule(
        'cluster',
        'cluster-1'
      )({ checksSchedules: { host: {}, cluster: { 'cluster-1': entry } } })
    ).toEqual(entry);
  });
});
