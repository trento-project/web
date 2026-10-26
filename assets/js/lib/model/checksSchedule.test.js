// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  INTERVALS,
  describeWindow,
  formToWindow,
  frequencyLabel,
  toFrequency,
  toInterval,
  windowToForm,
} from './checksSchedule';

describe('checksSchedule', () => {
  it('should list the intervals of the contract', () => {
    expect(INTERVALS).toEqual([
      '5m',
      '15m',
      '30m',
      '1h',
      '6h',
      '12h',
      '24h',
      '1w',
      '2w',
      '4w',
      'disabled',
    ]);
  });

  it('should split an interval into a value and a unit, and back', () => {
    expect(toFrequency('15m')).toEqual({ value: 15, unit: 'minutes' });
    expect(toFrequency('6h')).toEqual({ value: 6, unit: 'hours' });
    expect(toFrequency('2w')).toEqual({ value: 2, unit: 'weeks' });
    expect(toFrequency('disabled')).toEqual({ value: null, unit: 'disabled' });
    expect(toInterval({ value: 24, unit: 'hours' })).toBe('24h');
    expect(toInterval({ value: null, unit: 'disabled' })).toBe('disabled');
  });

  it('should label an interval', () => {
    expect(frequencyLabel('5m')).toBe('5 minutes');
    expect(frequencyLabel('1h')).toBe('1 hour');
    expect(frequencyLabel('1w')).toBe('1 week');
    expect(frequencyLabel('disabled')).toBe('Disabled');
  });

  describe('describeWindow', () => {
    const window = {
      starts_at: '2026-10-12T22:00:00Z',
      timezone: 'Europe/Berlin',
      duration_minutes: 60,
      recurrence: null,
    };

    it('should describe a missing window', () => {
      expect(describeWindow(null, 'Europe/Berlin')).toBe('None');
    });

    it('should describe a one-time window in the user timezone', () => {
      expect(describeWindow(window, 'Europe/Berlin')).toBe(
        '13 Oct 2026, 12:00 AM – 01:00 AM'
      );
    });

    it('should describe periodic windows', () => {
      expect(
        describeWindow(
          {
            ...window,
            recurrence: { frequency: 'weekly', interval: 1, weekdays: [1, 5] },
          },
          'Europe/Berlin'
        )
      ).toBe('Mondays, Fridays, 12:00 AM – 01:00 AM');

      expect(
        describeWindow(
          { ...window, recurrence: { frequency: 'yearly', interval: 1 } },
          'Europe/Berlin'
        )
      ).toBe('Every year on 13 Oct, 12:00 AM – 01:00 AM');
    });
  });

  describe('window form', () => {
    it('should start from no window', () => {
      expect(windowToForm(null, 'Etc/UTC')).toMatchObject({
        type: 'none',
        durationValue: '1',
        durationUnit: 'hours',
      });
      expect(formToWindow({ type: 'none' }, 'Etc/UTC')).toBeNull();
    });

    it('should turn a window into a form and back', () => {
      const window = {
        starts_at: '2026-10-12T22:00:00.000Z',
        timezone: 'Europe/Berlin',
        duration_minutes: 90,
        recurrence: { frequency: 'weekly', interval: 1, weekdays: [1, 5] },
      };

      const form = windowToForm(window, 'Europe/Berlin');

      expect(form).toEqual({
        type: 'periodic',
        date: '2026-10-13',
        time: '00:00',
        durationValue: '90',
        durationUnit: 'minutes',
        repeatValue: '1',
        repeatUnit: 'weeks',
        weekdays: [1, 5],
      });

      expect(formToWindow(form, 'Europe/Berlin')).toEqual(window);
    });
  });
});
