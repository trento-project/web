import { DEFAULT_TIMEZONE, parseDateTimeLocalToUtc } from './index';

import {
  formatDateTime,
  formatDateOnly,
  formatTimeOnly,
  formatOffset,
  computeTimezoneOffsets,
} from './index';

describe('timezone format constants', () => {
  const sampleDate = new Date('2024-08-04T10:21:00.123Z');

  it('formatDateTime returns correct string', () => {
    expect(formatDateTime(sampleDate, DEFAULT_TIMEZONE)).toBe(
      '04 Aug 2024, 10:21:00'
    );
  });

  it('formatDateOnly returns correct string', () => {
    expect(formatDateOnly(sampleDate, DEFAULT_TIMEZONE)).toBe('04 Aug 2024');
  });

  it('formatTimeOnly returns correct string', () => {
    expect(formatTimeOnly(sampleDate, DEFAULT_TIMEZONE)).toBe('10:21:00');
  });
});

describe('computeTimezoneOffsets', () => {
  it('returns browser offset and null profile when no timezone selected', () => {
    const now = new Date('2009-10-09T21:00:00.000Z');
    now.getTimezoneOffset = () => -120;

    const res = computeTimezoneOffsets(null, now);

    expect(res).toEqual({
      browserUtcOffset: 120,
      profileUtcOffset: null,
    });
  });

  it('returns both browser and profile offsets when timezone selected', () => {
    const now = new Date('2009-10-09T21:00:00.000Z');
    now.getTimezoneOffset = () => -120;

    const res = computeTimezoneOffsets({ value: 'Europe/Berlin' }, now);

    expect(res).toEqual({
      browserUtcOffset: 120,
      profileUtcOffset: 120,
    });
  });
});

describe('formatOffset', () => {
  it('formats positive offsets correctly', () => {
    expect(formatOffset(120)).toBe('+02:00');
    expect(formatOffset(30)).toBe('+00:30');
  });

  it('formats negative offsets correctly', () => {
    expect(formatOffset(-90)).toBe('-01:30');
    expect(formatOffset(-0)).toBe('+00:00');
  });

  it('formats zero offset as +00:00', () => {
    expect(formatOffset(0)).toBe('+00:00');
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
