import tzdata from 'tzdata';
import { tzName, tzOffset } from '@date-fns/tz';

export const DEFAULT_TIMEZONE = 'Etc/UTC';


/**
 * Generate timezone options from the IANA tzdata database.
 * Each option includes the timezone name and current UTC offset with DST accounted for.
 * Automatically filters out alias zones by checking if they're references to other zones.
 */
export function generateTimezoneOptions() {
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
  return zoneNames
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
}
