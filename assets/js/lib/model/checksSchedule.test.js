// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  describeWindow,
  formToWindow,
  frequencyLabel,
  toFrequency,
  toMinutes,
  windowToForm,
} from './checksSchedule';

describe('checksSchedule', () => {
  it('should split an interval into a value and a unit', () => {
    expect(toFrequency(15)).toEqual({ value: 15, unit: 'minutes' });
    expect(toFrequency(360)).toEqual({ value: 6, unit: 'hours' });
    expect(toFrequency(20160)).toEqual({ value: 2, unit: 'weeks' });
    expect(toMinutes({ value: 24, unit: 'hours' })).toBe(1440);
  });

  it('should label an interval', () => {
    expect(frequencyLabel(5)).toBe('5 minutes');
    expect(frequencyLabel(60)).toBe('1 hour');
    expect(frequencyLabel(10080)).toBe('1 week');
    expect(frequencyLabel(10)).toBe('10 minutes');
  });

  describe('describeWindow', () => {
    const window = {
      starts_at: '2026-10-12T22:00:00Z',
      duration: 60,
      timezone: 'Europe/Berlin',
      frequency: null,
      interval: 1,
      weekdays: [],
    };

    it('should describe a missing window', () => {
      expect(describeWindow(null, 'Europe/Berlin')).toBe('None');
    });

    it('should describe a one-time window in the user timezone', () => {
      expect(describeWindow(window, 'Europe/Berlin')).toBe(
        '13 Oct 2026, 12:00 AM – 01:00 AM'
      );
    });

    it('should describe recurring windows', () => {
      expect(
        describeWindow(
          { ...window, frequency: 'weekly', weekdays: [1, 5] },
          'Europe/Berlin'
        )
      ).toBe('Mondays, Fridays, 12:00 AM – 01:00 AM');

      expect(
        describeWindow(
          { ...window, frequency: 'weekly', interval: 2, weekdays: [1, 5] },
          'Europe/Berlin'
        )
      ).toBe('Every 2 weeks on Mondays, Fridays, 12:00 AM – 01:00 AM');

      expect(
        describeWindow({ ...window, frequency: 'daily' }, 'Europe/Berlin')
      ).toBe('Every day, 12:00 AM – 01:00 AM');

      expect(
        describeWindow(
          { ...window, frequency: 'monthly', interval: 3 },
          'Europe/Berlin'
        )
      ).toBe('Every 3 months on day 13, 12:00 AM – 01:00 AM');

      expect(
        describeWindow({ ...window, frequency: 'yearly' }, 'Europe/Berlin')
      ).toBe('Every year on 13 Oct, 12:00 AM – 01:00 AM');
    });
  });

  describe('window form', () => {
    it('should turn a periodic form into a window in the user timezone', () => {
      expect(
        formToWindow(
          {
            type: 'periodic',
            date: '2026-10-13',
            time: '00:00',
            durationValue: '1',
            durationUnit: 'hours',
            repeatValue: '2',
            repeatUnit: 'weeks',
            weekdays: [1, 5],
          },
          'Europe/Berlin'
        )
      ).toEqual({
        starts_at: '2026-10-12T22:00:00.000Z',
        duration: 60,
        timezone: 'Europe/Berlin',
        frequency: 'weekly',
        interval: 2,
        weekdays: [1, 5],
      });
    });

    it('should turn a one-time form into a window', () => {
      expect(
        formToWindow(
          {
            type: 'one_time',
            date: '2026-10-13',
            time: '10:30',
            durationValue: '45',
            durationUnit: 'minutes',
            repeatValue: '1',
            repeatUnit: 'days',
            weekdays: [3],
          },
          'Etc/UTC'
        )
      ).toEqual({
        starts_at: '2026-10-13T10:30:00.000Z',
        duration: 45,
        timezone: 'Etc/UTC',
        frequency: null,
        interval: 1,
        weekdays: [],
      });
    });

    it('should turn no window into none and back', () => {
      expect(formToWindow({ type: 'none' }, 'Etc/UTC')).toBeNull();
      expect(windowToForm(null, 'Etc/UTC')).toMatchObject({ type: 'none' });
    });

    it('should turn a window into a form in the user timezone', () => {
      expect(
        windowToForm(
          {
            starts_at: '2026-10-12T22:00:00Z',
            duration: 120,
            timezone: 'Europe/Berlin',
            frequency: 'weekly',
            interval: 2,
            weekdays: [1, 5],
          },
          'Europe/Berlin'
        )
      ).toEqual({
        type: 'periodic',
        date: '2026-10-13',
        time: '00:00',
        durationValue: '2',
        durationUnit: 'hours',
        repeatValue: '2',
        repeatUnit: 'weeks',
        weekdays: [1, 5],
      });
    });
  });
});
