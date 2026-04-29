import { tz, TZDate, tzName, tzOffset } from '@date-fns/tz';
import { format } from 'date-fns';
import tzdata from 'tzdata';

const DEFAULT_TIMEZONE = 'Etc/UTC';
const DATETIME_DAY_MONTH_24H_FORMAT = 'dd MMM yyyy, HH:mm:ss';
const DATE_DAY_MONTH_YEAR_FORMAT = 'dd MMM yyyy';
const TIME_24H_HH_MM_FORMAT = 'HH:mm:ss';

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

export {
  DATETIME_DAY_MONTH_24H_FORMAT,
  DATE_DAY_MONTH_YEAR_FORMAT,
  DEFAULT_TIMEZONE,
  TIME_24H_HH_MM_FORMAT,
  formatDateOnly,
  formatDateTime,
  formatTimeOnly,
  generateTimezoneOptions,
  parseDateTimeLocalToUtc,
  timezones,
};
