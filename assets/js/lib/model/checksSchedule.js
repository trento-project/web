// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  describeOccurrences,
  formToRecurrence,
  recurrenceToForm,
  todayIn,
} from '@lib/model/recurrence';

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

// Human readable summary of an exception window, in the user timezone
export const describeWindow = (window, timezone) =>
  window
    ? describeOccurrences(window, timezone, { duration: window.duration })
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

  const inHours = window.duration % 60 === 0;

  return {
    type: window.frequency ? 'periodic' : 'one_time',
    ...recurrenceToForm(window, timezone),
    durationValue: String(inHours ? window.duration / 60 : window.duration),
    durationUnit: inHours ? 'hours' : 'minutes',
  };
};

export const formToWindow = (form, timezone) => {
  if (form.type === 'none') return null;

  const { starts_at: startsAt, ...recurrence } = formToRecurrence(
    form,
    timezone,
    form.type === 'periodic'
  );

  return {
    starts_at: startsAt,
    duration:
      Number(form.durationValue) * (form.durationUnit === 'hours' ? 60 : 1),
    ...recurrence,
  };
};
