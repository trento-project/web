import { fromZonedTime } from 'date-fns-tz';
import {
  filterValueToSearchParams,
  searchParamsToAPIParams,
  searchParamsToFilterValue,
} from './searchParams';

describe('searchParams helpers', () => {});
describe('searchParamsToAPIParams', () => {
  it('should convert search params to API params', () => {
    const nowUTC = '2024-08-01T17:23:00.000Z';

    const sp = new URLSearchParams();
    sp.append('from_date', 'custom');
    sp.append('from_date', nowUTC);
    sp.append('type', 'login_attempt');
    sp.append('type', 'resource_tagging');

    const result = searchParamsToAPIParams(sp);

    expect(result).toEqual({
      from_date: nowUTC,
      type: ['login_attempt', 'resource_tagging'],
    });
  });
});

describe('searchParamsToFilterValue', () => {
  it('should convert search params to filter value', () => {
    const nowUTC = '2024-08-01T17:23:00.000Z';

    const sp = new URLSearchParams();
    sp.append('from_date', 'custom');
    sp.append('from_date', nowUTC);
    sp.append('type', 'login_attempt');
    sp.append('type', 'resource_tagging');

    const result = searchParamsToFilterValue(sp);

    expect(result).toEqual({
      from_date: ['custom', expect.any(Date)],
      type: ['login_attempt', 'resource_tagging'],
    });

    expect(result.from_date[1].getHours()).toEqual(17);
  });
});

describe('filterValueToSearchParams', () => {
  it('should convert filter value to search params', () => {
    const now = new Date();
    const utcNow = fromZonedTime(now).toISOString();

    const filterValue = {
      from_date: ['custom', now],
      type: ['login_attempt', 'resource_tagging'],
    };

    const result = filterValueToSearchParams(filterValue);

    expect(result.getAll('from_date')).toEqual(['custom', utcNow]);
    expect(result.getAll('type')).toEqual([
      'login_attempt',
      'resource_tagging',
    ]);
  });

  it('should use a fresh URLSearchParams instance', () => {
    const now = new Date();
    const utcNow = fromZonedTime(now).toISOString();

    const filterValue = {
      from_date: ['custom', now],
      type: ['login_attempt', 'resource_tagging'],
    };

    // apply two times to test if the function is using a fresh URLSearchParams instance
    /*          */ filterValueToSearchParams(filterValue);
    const result = filterValueToSearchParams(filterValue);

    expect(result.getAll('from_date')).toEqual(['custom', utcNow]);
    expect(result.getAll('type')).toEqual([
      'login_attempt',
      'resource_tagging',
    ]);
  });

  it('should return an instance of URLSearchParams when filters are empty', () => {
    const filterValue = {};

    const result = filterValueToSearchParams(filterValue);

    expect(result).toEqual(expect.any(URLSearchParams));
  });
});
