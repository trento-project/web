import tzdata from 'tzdata';


// Default timezone is set to UTC until a user explicitly selects one.
export const DEFAULT_TIMEZONE = 'Etc/UTC';

/**
 * Get the UTC offset for a timezone, accounting for DST. If invalid, returns 'UTC'.
 * See https://www.iana.org/time-zones for valid timezone identifiers.
 * @param {string} timezone - IANA timezone identifier
 * @param {Date} [date=new Date()] - Date to calculate offset for (defaults to today)
 */
export function getUtcOffset(timezone, date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(date);
    return parts.find((p) => p.type === 'timeZoneName')?.value || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Generate timezone options from the IANA tzdata database.
 * Each option includes the current UTC offset with DST accounted for.
 */
export function generateTimezoneOptions() {
  const zoneNames = Object.keys(tzdata.zones || {})
    .filter((zone) => {
      // Keep UTC/GMT but exclude other deprecated Etc/ zones
      if (zone.startsWith('Etc/')) {
        return ['Etc/UTC', 'Etc/GMT'].includes(zone);
      }
      return true;
    })
    .sort();

  return zoneNames.map((zone) => ({
    value: zone,
    label: `${zone} (${getUtcOffset(zone)})`,
    searchLabel: zone,
  }));
}
