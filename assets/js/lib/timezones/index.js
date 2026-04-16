import tzdata from 'tzdata';
import { tzName, tzOffset } from '@date-fns/tz';

export const DEFAULT_TIMEZONE = 'Etc/UTC';

export const DATETIME_ISO_SQL_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DATETIME_US_12H_FORMAT = 'MM/dd/yyyy hh:mm:ss a';
export const DATETIME_ISO_LOCAL_MILLIS_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS";
export const DATETIME_LOCALE_LONG_FORMAT = 'PPpp';
export const DATETIME_MONTH_NAME_24H_FORMAT = 'MMMM dd, yyyy, HH:mm:ss';
export const DATETIME_DAY_MONTH_24H_FORMAT = 'dd MMM yyyy, HH:mm:ss';
export const DATETIME_WEEKDAY_SHORT_24H_FORMAT = 'iii MMM dd, HH:mm:ss y';
export const DATETIME_WEEKDAY_NO_COMMA_24H_FORMAT = 'iii MMM dd HH:mm:ss yyyy';
export const DATE_DAY_MONTH_YEAR_FORMAT = 'dd MMM yyyy'; // TODO: equals to 'dd MMM y'?
export const DATE_DAY_MONTH_YEAR_PADDED_FORMAT = 'dd MMM y'; // TODO: equals to 'dd MMM yyyy'?
export const DATE_DAY_MONTH_YEAR_COMPACT_FORMAT = 'd LLL yyyy'; // TODO: equals to 'd MMM y'?
export const DATE_MONTH_NAME_YEAR_FORMAT = 'MMMM dd, yyyy';
export const TIME_24H_HH_MM_FORMAT = 'HH:mm';

/**
 * Generate timezone options from the IANA tzdata database.
 * Each option includes the timezone name and current UTC offset with DST accounted for.
 * Automatically filters out alias zones by checking if they're references to other zones.
 *
 * Results are cached at module level for performance since timezone data doesn't change at runtime.
 */
let cachedTimezoneOptions = null;

export function generateTimezoneOptions() {
  if (cachedTimezoneOptions !== null) {
    return cachedTimezoneOptions;
  }

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
  cachedTimezoneOptions = zoneNames
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

  return cachedTimezoneOptions;
}
