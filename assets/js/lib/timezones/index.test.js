import { format as formatDate } from 'date-fns';
import { tz } from '@date-fns/tz';
import {
  DATE_DAY_MONTH_YEAR_FORMAT,
  DATE_DAY_ABBR_MONTH_YEAR_FORMAT,
  DATE_DAY_MONTH_YEAR_COMPACT_FORMAT,
  DATE_DAY_MONTH_YEAR_PADDED_FORMAT,
  DATE_MONTH_NAME_YEAR_FORMAT,
  DATETIME_ISO_SQL_FORMAT,
  DATETIME_US_12H_FORMAT,
  DATETIME_ISO_LOCAL_MILLIS_FORMAT,
  DATETIME_LOCALE_LONG_FORMAT,
  DATETIME_MONTH_NAME_24H_FORMAT,
  DATETIME_DAY_MONTH_24H_FORMAT,
  DATETIME_WEEKDAY_SHORT_24H_FORMAT,
  DATETIME_WEEKDAY_NO_COMMA_24H_FORMAT,
  DEFAULT_TIMEZONE,
  TIME_24H_HH_MM_FORMAT,
  parseDateTimeLocalToUtc,
} from './index';

describe('timezone format constants', () => {
  const sampleDate = new Date('2024-08-04T10:21:00.123Z');
  const formatInDefaultTimezone = (pattern) =>
    formatDate(sampleDate, pattern, { in: tz(DEFAULT_TIMEZONE) });

  it('has an example output for every datetime/date/time format constant', () => {
    expect(formatInDefaultTimezone(DATETIME_ISO_SQL_FORMAT)).toBe(
      '2024-08-04 10:21:00'
    );
    expect(formatInDefaultTimezone(DATETIME_US_12H_FORMAT)).toBe(
      '08/04/2024 10:21:00 AM'
    );
    expect(formatInDefaultTimezone(DATETIME_ISO_LOCAL_MILLIS_FORMAT)).toBe(
      '2024-08-04T10:21:00.123'
    );
    expect(formatInDefaultTimezone(DATETIME_LOCALE_LONG_FORMAT)).toBe(
      'Aug 4, 2024, 10:21:00 AM'
    );
    expect(formatInDefaultTimezone(DATETIME_MONTH_NAME_24H_FORMAT)).toBe(
      'August 04, 2024, 10:21:00'
    );
    expect(formatInDefaultTimezone(DATETIME_DAY_MONTH_24H_FORMAT)).toBe(
      '04 Aug 2024, 10:21:00'
    );
    expect(formatInDefaultTimezone(DATETIME_WEEKDAY_SHORT_24H_FORMAT)).toBe(
      'Sun Aug 04, 10:21:00 2024'
    );
    expect(formatInDefaultTimezone(DATETIME_WEEKDAY_NO_COMMA_24H_FORMAT)).toBe(
      'Sun Aug 04 10:21:00 2024'
    );

    expect(formatInDefaultTimezone(DATE_DAY_MONTH_YEAR_FORMAT)).toBe(
      '04 Aug 2024'
    );
    expect(formatInDefaultTimezone(DATE_DAY_ABBR_MONTH_YEAR_FORMAT)).toBe(
      '4 Aug 2024'
    );
    expect(formatInDefaultTimezone(DATE_DAY_MONTH_YEAR_COMPACT_FORMAT)).toBe(
      '4 Aug 2024'
    );
    expect(formatInDefaultTimezone(DATE_DAY_MONTH_YEAR_PADDED_FORMAT)).toBe(
      '04 Aug 2024'
    );
    expect(formatInDefaultTimezone(DATE_MONTH_NAME_YEAR_FORMAT)).toBe(
      'August 04, 2024'
    );
    expect(formatInDefaultTimezone(TIME_24H_HH_MM_FORMAT)).toBe('10:21');
  });
});

describe('parseDateTimeLocalToUtc', () => {
  it('parses datetime-local as UTC when timezone is Etc/UTC', () => {
    const d = parseDateTimeLocalToUtc('2024-08-14T21:00', 'Etc/UTC');
    expect(d.toISOString()).toBe('2024-08-14T21:00:00.000Z');
  });

  it('parses datetime-local in Europe/Berlin (UTC+02:00) to correct UTC', () => {
    const d = parseDateTimeLocalToUtc('2024-08-14T21:00', 'Europe/Berlin');
    // 21:00 in Berlin (UTC+2) is 19:00 UTC
    expect(d.toISOString()).toBe('2024-08-14T19:00:00.000Z');
  });

  it('parses datetime-local in Pacific/Kiritimati (UTC+14) to correct UTC', () => {
    const d = parseDateTimeLocalToUtc('2024-03-31T03:30', 'Pacific/Kiritimati');
    // 03:30 in UTC+14 is previous day 13:30 UTC
    expect(d.toISOString()).toBe('2024-03-30T13:30:00.000Z');
  });
});

describe('generateTimezoneOptions', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('keeps canonical zones, excludes aliases, and preserves Etc/UTC only among Etc zones', () => {
    jest.doMock('tzdata', () => ({
      zones: {
        'Etc/UTC': [0],
        'Etc/GMT+1': [0],
        'Europe/Berlin': [0],
        'America/New_York': [0],
        Factory: [0],
        'America/Argentina/Cordoba': 'America/Cordoba',
      },
    }));

    jest.doMock('@date-fns/tz', () => ({
      tzOffset: (zone) =>
        ({
          'Etc/UTC': 0,
          'Europe/Berlin': 120,
          'America/New_York': -240,
        })[zone],
      tzName: (zone, _date, type) => {
        const names = {
          'Etc/UTC': {
            shortOffset: 'UTC+00:00',
            longGeneric: 'Coordinated Universal Time',
          },
          'Europe/Berlin': {
            shortOffset: 'UTC+02:00',
            longGeneric: 'Central European Time',
          },
          'America/New_York': {
            shortOffset: 'UTC-04:00',
            longGeneric: 'Eastern Time',
          },
        };
        return names[zone][type];
      },
    }));

    let generateTimezoneOptions;
    jest.isolateModules(() => {
      ({ generateTimezoneOptions } = require('./index'));
    });

    expect(generateTimezoneOptions()).toEqual([
      {
        value: 'America/New_York',
        label: 'America/New_York - Eastern Time (UTC-04:00)',
        searchLabel: 'America/New_York',
      },
      {
        value: 'Etc/UTC',
        label: 'Etc/UTC - Coordinated Universal Time (UTC+00:00)',
        searchLabel: 'Etc/UTC',
      },
      {
        value: 'Europe/Berlin',
        label: 'Europe/Berlin - Central European Time (UTC+02:00)',
        searchLabel: 'Europe/Berlin',
      },
    ]);
  });

  it('sorts by UTC offset and then alphabetically by zone', () => {
    jest.doMock('tzdata', () => ({
      zones: {
        'Zone/B': [0],
        'Zone/A': [0],
        'Zone/C': [0],
      },
    }));

    jest.doMock('@date-fns/tz', () => ({
      tzOffset: (zone) =>
        ({
          'Zone/C': -60,
          'Zone/A': 0,
          'Zone/B': 0,
        })[zone],
      tzName: (_zone, _date, type) =>
        type === 'shortOffset' ? 'UTC+00:00' : 'Mock Timezone',
    }));

    let generateTimezoneOptions;
    jest.isolateModules(() => {
      ({ generateTimezoneOptions } = require('./index'));
    });

    expect(generateTimezoneOptions().map(({ value }) => value)).toEqual([
      'Zone/C',
      'Zone/A',
      'Zone/B',
    ]);
  });

  it('skips zones that throw while computing labels', () => {
    jest.doMock('tzdata', () => ({
      zones: {
        'Etc/UTC': [0],
        'Broken/Zone': [0],
      },
    }));

    jest.doMock('@date-fns/tz', () => ({
      tzOffset: () => 0,
      tzName: (zone, _date, type) => {
        if (zone === 'Broken/Zone') {
          throw new RangeError('Invalid time zone');
        }

        return type === 'shortOffset'
          ? 'UTC+00:00'
          : 'Coordinated Universal Time';
      },
    }));

    let generateTimezoneOptions;
    jest.isolateModules(() => {
      ({ generateTimezoneOptions } = require('./index'));
    });

    expect(generateTimezoneOptions()).toEqual([
      {
        value: 'Etc/UTC',
        label: 'Etc/UTC - Coordinated Universal Time (UTC+00:00)',
        searchLabel: 'Etc/UTC',
      },
    ]);
  });
});
