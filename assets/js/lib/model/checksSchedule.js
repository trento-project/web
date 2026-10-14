// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { tz } from '@date-fns/tz';
import { addMinutes, format, parseISO } from 'date-fns';

import { parseDateTimeLocalToUtc } from '@lib/timezones';

// Selectable checks execution intervals, grouped by unit
export const FREQUENCY_UNITS = {
  minutes: {
    label: 'Minutes',
    singular: 'minute',
    minutes: 1,
    values: [5, 15, 30],
  },
  hours: {
    label: 'Hours',
    singular: 'hour',
    minutes: 60,
    values: [1, 6, 12, 24],
  },
  weeks: {
    label: 'Weeks',
    singular: 'week',
    minutes: 10080,
    values: [1, 2, 4],
  },
};

export const toFrequency = (minutes) => {
  const [unit, { minutes: unitMinutes }] = Object.entries(FREQUENCY_UNITS)
    .reverse()
    .find(
      ([_unit, { minutes: candidate, values }]) =>
        minutes % candidate === 0 && values.includes(minutes / candidate)
    ) || ['minutes', FREQUENCY_UNITS.minutes];

  return { value: minutes / unitMinutes, unit };
};

export const toMinutes = ({ value, unit }) =>
  Number(value) * FREQUENCY_UNITS[unit].minutes;

export const frequencyLabel = (minutes) => {
  const { value, unit } = toFrequency(minutes);
  const { singular } = FREQUENCY_UNITS[unit];
  return `${value} ${value === 1 ? singular : `${singular}s`}`;
};

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

const PERIODS = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
};

const inTimezone = (date, formatStr, timezone) =>
  format(date, formatStr, { in: tz(timezone) });

// Human readable summary of an exception window, in the user timezone
export const describeWindow = (window, timezone) => {
  if (!window) return 'None';

  const {
    starts_at: startsAt,
    duration,
    frequency,
    interval = 1,
    weekdays = [],
  } = window;

  const start = parseISO(startsAt);
  const range = `${inTimezone(start, 'hh:mm a', timezone)} – ${inTimezone(addMinutes(start, duration), 'hh:mm a', timezone)}`;

  if (!frequency) {
    return `${inTimezone(start, 'dd MMM yyyy', timezone)}, ${range}`;
  }

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
        ? `${days}, ${range}`
        : `${every} on ${days}, ${range}`;
    }
    case 'monthly':
      return `${every} on day ${inTimezone(start, 'd', timezone)}, ${range}`;
    case 'yearly':
      return `${every} on ${inTimezone(start, 'd MMM', timezone)}, ${range}`;
    default:
      return `${every}, ${range}`;
  }
};

const REPEAT_UNITS = {
  days: 'daily',
  weeks: 'weekly',
  months: 'monthly',
  years: 'yearly',
};

const repeatUnitOf = (frequency) =>
  Object.keys(REPEAT_UNITS).find((unit) => REPEAT_UNITS[unit] === frequency);

const defaultForm = (timezone) => ({
  type: 'none',
  date: inTimezone(new Date(), 'yyyy-MM-dd', timezone),
  time: '00:00',
  durationValue: '1',
  durationUnit: 'hours',
  repeatValue: '1',
  repeatUnit: 'days',
  weekdays: [],
});

// Exception window edited in the settings modal, in the user timezone
export const windowToForm = (window, timezone) => {
  if (!window) return defaultForm(timezone);

  const start = parseISO(window.starts_at);
  const inHours = window.duration % 60 === 0;

  return {
    type: window.frequency ? 'periodic' : 'one_time',
    date: inTimezone(start, 'yyyy-MM-dd', timezone),
    time: inTimezone(start, 'HH:mm', timezone),
    durationValue: String(inHours ? window.duration / 60 : window.duration),
    durationUnit: inHours ? 'hours' : 'minutes',
    repeatValue: String(window.interval || 1),
    repeatUnit: repeatUnitOf(window.frequency) || 'days',
    weekdays: window.weekdays || [],
  };
};

export const formToWindow = (form, timezone) => {
  if (form.type === 'none') return null;

  const periodic = form.type === 'periodic';
  const frequency = periodic ? REPEAT_UNITS[form.repeatUnit] : null;

  return {
    starts_at: parseDateTimeLocalToUtc(
      `${form.date}T${form.time}`,
      timezone
    ).toISOString(),
    duration:
      Number(form.durationValue) * (form.durationUnit === 'hours' ? 60 : 1),
    timezone,
    frequency,
    interval: periodic ? Number(form.repeatValue) : 1,
    weekdays: frequency === 'weekly' ? form.weekdays : [],
  };
};
