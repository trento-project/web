// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

// One-time and periodic schedules shared by checks exception windows and
// operation schedules. A schedule has starts_at, timezone and a recurrence,
// null for a one-time schedule. See Trento.Scheduling.Recurrence for the rules.

import { tz } from '@date-fns/tz';
import { addMinutes, format, parseISO } from 'date-fns';

import { formatDateOnly, parseDateTimeLocalToUtc } from '@lib/timezones';

const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const WEEKDAYS = WEEKDAY_NAMES.map((label, index) => ({
  value: index + 1,
  label,
}));

export const REPEAT_UNITS = [
  { value: 'days', label: 'Days', frequency: 'daily' },
  { value: 'weeks', label: 'Weeks', frequency: 'weekly' },
  { value: 'months', label: 'Months', frequency: 'monthly' },
  { value: 'years', label: 'Years', frequency: 'yearly' },
];

const PERIODS = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
};

const inTimezone = (date, formatStr, timezone) =>
  format(date, formatStr, { in: tz(timezone) });

export const todayIn = (timezone) =>
  inTimezone(new Date(), 'yyyy-MM-dd', timezone);

const endsSuffix = ({ ends_on: endsOn, max_occurrences: maxOccurrences }) => {
  if (endsOn) return `, until ${formatDateOnly(parseISO(endsOn))} (excluded)`;
  if (maxOccurrences) return `, ${maxOccurrences} times`;
  return '';
};

/**
 * Human readable summary of a schedule, in the user timezone.
 * With a duration, each occurrence is shown as a time range.
 */
export const describeOccurrences = (schedule, timezone, { duration } = {}) => {
  const { starts_at: startsAt, recurrence } = schedule;

  const start = parseISO(startsAt);
  const startTime = inTimezone(start, 'hh:mm a', timezone);
  const when = duration
    ? `, ${startTime} – ${inTimezone(addMinutes(start, duration), 'hh:mm a', timezone)}`
    : ` at ${startTime}`;

  if (!recurrence) {
    return `${inTimezone(start, 'dd MMM yyyy', timezone)}${when}`;
  }

  const { frequency, interval = 1, weekdays = [] } = recurrence;
  const ends = endsSuffix(recurrence);
  const period = PERIODS[frequency];
  const every =
    interval === 1 ? `Every ${period}` : `Every ${interval} ${period}s`;

  switch (frequency) {
    case 'weekly': {
      const days = (
        weekdays.length > 0
          ? weekdays
          : [Number(inTimezone(start, 'i', timezone))]
      )
        .map((day) => `${WEEKDAY_NAMES[day - 1]}s`)
        .join(', ');
      return interval === 1
        ? `${days}${when}${ends}`
        : `${every} on ${days}${when}${ends}`;
    }
    case 'monthly':
      return `${every} on day ${inTimezone(start, 'd', timezone)}${when}${ends}`;
    case 'yearly':
      return `${every} on ${inTimezone(start, 'd MMM', timezone)}${when}${ends}`;
    default:
      return `${every}${when}${ends}`;
  }
};

// Start and repetition of a schedule, as edited in the forms
export const recurrenceToForm = (
  { starts_at: startsAt, recurrence },
  timezone
) => {
  const start = parseISO(startsAt);

  return {
    date: inTimezone(start, 'yyyy-MM-dd', timezone),
    time: inTimezone(start, 'HH:mm', timezone),
    repeatValue: String(recurrence?.interval || 1),
    repeatUnit:
      REPEAT_UNITS.find(({ frequency }) => frequency === recurrence?.frequency)
        ?.value || 'days',
    weekdays: recurrence?.weekdays || [],
  };
};

export const formToRecurrence = (form, timezone, periodic) => {
  const starts = {
    starts_at: parseDateTimeLocalToUtc(
      `${form.date}T${form.time}`,
      timezone
    ).toISOString(),
    timezone,
  };

  if (!periodic) return { ...starts, recurrence: null };

  const { frequency } = REPEAT_UNITS.find(
    ({ value }) => value === form.repeatUnit
  );

  return {
    ...starts,
    recurrence: {
      frequency,
      interval: Number(form.repeatValue),
      weekdays: frequency === 'weekly' ? form.weekdays : [],
    },
  };
};
