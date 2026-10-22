// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  describeOccurrences,
  formToRecurrence,
  recurrenceToForm,
} from './recurrence';

const schedule = {
  starts_at: '2026-10-24T01:00:00Z',
  timezone: 'Europe/Berlin',
  frequency: null,
  interval: 1,
  weekdays: [],
};

describe('recurrence', () => {
  describe('describeOccurrences', () => {
    it('should describe a one-time occurrence in the user timezone', () => {
      expect(describeOccurrences(schedule, 'Europe/Berlin')).toBe(
        '24 Oct 2026 at 03:00 AM'
      );
    });

    it('should describe periodic occurrences with their end', () => {
      expect(
        describeOccurrences(
          {
            ...schedule,
            frequency: 'weekly',
            interval: 2,
            weekdays: [6, 7],
            max_occurrences: 5,
          },
          'Europe/Berlin'
        )
      ).toBe('Every 2 weeks on Saturdays, Sundays at 03:00 AM, 5 times');

      expect(
        describeOccurrences(
          { ...schedule, frequency: 'daily', ends_on: '2027-06-01' },
          'Europe/Berlin'
        )
      ).toBe('Every day at 03:00 AM, until 01 Jun 2027 (excluded)');
    });

    it('should describe occurrences lasting some minutes as a time range', () => {
      expect(
        describeOccurrences(
          { ...schedule, frequency: 'monthly' },
          'Europe/Berlin',
          {
            duration: 90,
          }
        )
      ).toBe('Every month on day 24, 03:00 AM – 04:30 AM');
    });
  });

  describe('recurrence form', () => {
    const form = {
      date: '2026-10-24',
      time: '03:00',
      repeatValue: '2',
      repeatUnit: 'weeks',
      weekdays: [6, 7],
    };

    it('should turn a periodic form into a recurrence in the user timezone', () => {
      expect(formToRecurrence(form, 'Europe/Berlin', true)).toEqual({
        starts_at: '2026-10-24T01:00:00.000Z',
        timezone: 'Europe/Berlin',
        frequency: 'weekly',
        interval: 2,
        weekdays: [6, 7],
      });
    });

    it('should turn a one-time form into a recurrence', () => {
      expect(formToRecurrence(form, 'Etc/UTC', false)).toEqual({
        starts_at: '2026-10-24T03:00:00.000Z',
        timezone: 'Etc/UTC',
        frequency: null,
        interval: 1,
        weekdays: [],
      });
    });

    it('should turn a recurrence into a form in the user timezone', () => {
      expect(
        recurrenceToForm(
          { ...schedule, frequency: 'weekly', interval: 2, weekdays: [6, 7] },
          'Europe/Berlin'
        )
      ).toEqual(form);
    });
  });
});
