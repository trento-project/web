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
    DEFAULT_TIMEZONE,
    TIME_24H_HH_MM_FORMAT,
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

        expect(formatInDefaultTimezone(DATE_DAY_MONTH_YEAR_FORMAT)).toBe('04 Aug 2024');
        expect(formatInDefaultTimezone(DATE_DAY_ABBR_MONTH_YEAR_FORMAT)).toBe('4 Aug 2024');
        expect(formatInDefaultTimezone(DATE_DAY_MONTH_YEAR_COMPACT_FORMAT)).toBe('4 Aug 2024');
        expect(formatInDefaultTimezone(DATE_DAY_MONTH_YEAR_PADDED_FORMAT)).toBe('04 Aug 2024');
        expect(formatInDefaultTimezone(DATE_MONTH_NAME_YEAR_FORMAT)).toBe('August 04, 2024');
        expect(formatInDefaultTimezone(TIME_24H_HH_MM_FORMAT)).toBe('10:21');
    });
});
