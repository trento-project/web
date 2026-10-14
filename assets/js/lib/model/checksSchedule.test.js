// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { inExceptionWindow, intervalLabel } from './checksSchedule';

describe('checksSchedule', () => {
  it('should label an interval', () => {
    expect(intervalLabel(5)).toBe('5 minutes');
    expect(intervalLabel(10080)).toBe('1 week');
    expect(intervalLabel(10)).toBe('10 minutes');
  });

  it('should tell whether a time falls inside an exception window', () => {
    const windows = [{ starts_at: '2026-10-14T10:00:00Z', duration: 30 }];

    expect(inExceptionWindow(windows, new Date('2026-10-14T09:59:59Z'))).toBe(
      false
    );
    expect(inExceptionWindow(windows, new Date('2026-10-14T10:00:00Z'))).toBe(
      true
    );
    expect(inExceptionWindow(windows, new Date('2026-10-14T10:29:59Z'))).toBe(
      true
    );
    expect(inExceptionWindow(windows, new Date('2026-10-14T10:30:00Z'))).toBe(
      false
    );
    expect(inExceptionWindow(undefined, new Date())).toBe(false);
  });
});
