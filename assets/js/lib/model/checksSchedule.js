// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  describeOccurrences,
  formToRecurrence,
  recurrenceToForm,
  todayIn,
} from '@lib/model/recurrence';

// Checks execution intervals of the scheduling contract
export const INTERVALS = [
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
];

export const DISABLED = 'disabled';

// Selectable checks execution intervals, grouped by unit
export const FREQUENCY_UNITS = {
  minutes: {
    label: 'Minutes',
    singular: 'minute',
    suffix: 'm',
    values: [5, 15, 30],
  },
  hours: {
    label: 'Hours',
    singular: 'hour',
    suffix: 'h',
    values: [1, 6, 12, 24],
  },
  weeks: { label: 'Weeks', singular: 'week', suffix: 'w', values: [1, 2, 4] },
};

export const toFrequency = (interval) => {
  if (interval === DISABLED) return { value: null, unit: DISABLED };

  const [unit] = Object.entries(FREQUENCY_UNITS).find(([_unit, { suffix }]) =>
    interval.endsWith(suffix)
  );

  return { value: parseInt(interval, 10), unit };
};

export const toInterval = ({ value, unit }) =>
  unit === DISABLED ? DISABLED : `${value}${FREQUENCY_UNITS[unit].suffix}`;

export const frequencyLabel = (interval) => {
  if (interval === DISABLED) return 'Disabled';

  const { value, unit } = toFrequency(interval);
  const { singular } = FREQUENCY_UNITS[unit];
  return `${value} ${value === 1 ? singular : `${singular}s`}`;
};

// Human readable summary of an exception window, in the user timezone
export const describeWindow = (window, timezone) =>
  window
    ? describeOccurrences(window, timezone, {
        duration: window.duration_minutes,
      })
    : 'None';

// Exception window edited in the settings modal, in the user timezone
export const windowToForm = (window, timezone) => {
  if (!window) {
    return {
      type: 'none',
      date: todayIn(timezone),
      time: '00:00',
      durationValue: '1',
      durationUnit: 'hours',
      repeatValue: '1',
      repeatUnit: 'days',
      weekdays: [],
    };
  }

  const inHours = window.duration_minutes % 60 === 0;

  return {
    type: window.recurrence ? 'periodic' : 'one_time',
    ...recurrenceToForm(window, timezone),
    durationValue: String(
      inHours ? window.duration_minutes / 60 : window.duration_minutes
    ),
    durationUnit: inHours ? 'hours' : 'minutes',
  };
};

export const formToWindow = (form, timezone) => {
  if (form.type === 'none') return null;

  const { starts_at: startsAt, recurrence } = formToRecurrence(
    form,
    timezone,
    form.type === 'periodic'
  );

  return {
    starts_at: startsAt,
    timezone,
    duration_minutes:
      Number(form.durationValue) * (form.durationUnit === 'hours' ? 60 : 1),
    recurrence,
  };
};
