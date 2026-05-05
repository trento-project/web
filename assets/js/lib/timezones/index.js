/*
 * SPDX-FileCopyrightText: SUSE LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { tz, TZDate, tzName, tzOffset } from '@date-fns/tz';
import { format } from 'date-fns';
import tzdata from 'tzdata';

const DEFAULT_TIMEZONE = 'Etc/UTC';
const DATETIME_DAY_MONTH_24H_FORMAT = 'dd MMM yyyy, HH:mm:ss'; // For formatting date and time values in the UI (e.g., "01 Jun 2024, 14:30:00")
const DATE_DAY_MONTH_YEAR_FORMAT = 'dd MMM yyyy'; // For formatting date-only values in the UI (e.g., "01 Jun 2024")
const TIME_24H_HH_MM_FORMAT = 'HH:mm:ss'; // For formatting time-only values in the UI (e.g., "14:30:00")
const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm"; // For parsing datetime-local input values (e.g., "2024-06-01T14:30")

/**
 * Generate timezone options from the IANA tzdata database.
 * Each option includes the timezone name and current UTC offset with DST accounted for.
 * Automatically filters out alias zones by checking if they're references to other zones.
 */
function generateTimezoneOptions() {
  const zoneNames = Object.entries(tzdata?.zones)
    .filter(([zone, data]) => {
      if (typeof data === 'string') {
        return false;
      }

      if (zone.startsWith('Etc/')) {
        return zone === DEFAULT_TIMEZONE;
      }

      return !zone.startsWith('Factory');
    })
    .map(([zone]) => zone);

  const now = new Date();
  const timezoneOptions = zoneNames
    .map((zone) => {
      try {
        // Current UTC offset in minutes for the timezone, accounting for DST if applicable.
        const offsetMinutes = tzOffset(zone, now);

        // Format the offset as a short label (e.g., "UTC+02:00").
        const offsetLabel = tzName(zone, now, 'shortOffset');

        // Generic timezone name to avoid DST-specific wording in the UI.
        const tzNameLong = tzName(zone, now, 'longGeneric');

        return {
          value: zone, // "Europe/Berlin"
          label: `${zone} - ${tzNameLong} (${offsetLabel})`, // "Europe/Berlin - Central European Time (UTC+02:00)"
          searchLabel: zone,
          offsetMinutes,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.offsetMinutes - b.offsetMinutes || a.value.localeCompare(b.value)
    )
    .map(({ offsetMinutes, ...option }) => option);

  return timezoneOptions;
}

// Parse datetime-local string (YYYY-MM-DDTHH:mm) as a date in timezone
function parseDateTimeLocalToUtc(dateTimeLocalValue, timezone) {
  const [datePart, timePart] = dateTimeLocalValue.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  const zonedDate = new TZDate(year, month - 1, day, hour, minute, 0, timezone);
  return new Date(zonedDate.getTime());
}

const timezones = generateTimezoneOptions();

// Internal helper to format a date with a given format and timezone
function formatWithTimezone(date, formatStr, timezone) {
  return format(date, formatStr, { in: tz(timezone) });
}

// formatDateTime formats returns, in the specified timezone, a date formatted as "dd MMM yyyy, HH:mm:ss"
function formatDateTime(date, timezone = DEFAULT_TIMEZONE) {
  return formatWithTimezone(date, DATETIME_DAY_MONTH_24H_FORMAT, timezone);
}

// formatDateOnly returns, in the specified timezone, a date formatted as "dd MMM yyyy"
function formatDateOnly(date, timezone = DEFAULT_TIMEZONE) {
  return formatWithTimezone(date, DATE_DAY_MONTH_YEAR_FORMAT, timezone);
}

// formatTimeOnly returns, in the specified timezone, a date formatted as "HH:mm:ss"
function formatTimeOnly(date, timezone = DEFAULT_TIMEZONE) {
  return formatWithTimezone(date, TIME_24H_HH_MM_FORMAT, timezone);
}

// Compute browser/profile offsets
function computeTimezoneOffsets(selectedTimezone, now = new Date()) {
  const browserUtcOffset = -now.getTimezoneOffset();
  const profileUtcOffset =
    selectedTimezone && selectedTimezone.value
      ? tzOffset(selectedTimezone.value, now)
      : null;

  return { browserUtcOffset, profileUtcOffset };
}

// Directly formats offsets, e.g. -120 -> "-02:00",
// instead of relying on tzName or format,
// which can return different formats based on the locale and DST status.
function formatOffset(offsetMinutes) {
  const sign = offsetMinutes < 0 ? '-' : '+';
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.trunc(abs / 60)).padStart(2, '0');
  const minutes = String(abs % 60).padStart(2, '0');

  return `${sign}${hours}:${minutes}`;
}

export {
  DATETIME_DAY_MONTH_24H_FORMAT,
  DATETIME_LOCAL_FORMAT,
  DATE_DAY_MONTH_YEAR_FORMAT,
  DEFAULT_TIMEZONE,
  TIME_24H_HH_MM_FORMAT,
  computeTimezoneOffsets,
  formatDateOnly,
  formatDateTime,
  formatOffset,
  formatTimeOnly,
  generateTimezoneOptions,
  parseDateTimeLocalToUtc,
  timezones,
};
