// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { addMinutes, isWithinInterval, parseISO } from 'date-fns';

// Selectable checks execution intervals, in minutes
export const CHECKS_INTERVALS = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 360, label: '6 hours' },
  { value: 720, label: '12 hours' },
  { value: 1440, label: '24 hours' },
  { value: 10080, label: '1 week' },
  { value: 20160, label: '2 weeks' },
  { value: 40320, label: '4 weeks' },
];

export const intervalLabel = (minutes) =>
  CHECKS_INTERVALS.find(({ value }) => value === minutes)?.label ||
  `${minutes} minutes`;

export const isWindowActive = ({ starts_at: startsAt, duration }, at) => {
  const start = parseISO(startsAt);
  const end = addMinutes(start, duration);
  return isWithinInterval(at, { start, end }) && at < end;
};

export const inExceptionWindow = (windows = [], at = new Date()) =>
  windows.some((window) => isWindowActive(window, at));
