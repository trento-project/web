import { fromZonedTime } from 'date-fns-tz';
import { faker } from '@faker-js/faker';
import {
  filterValueToSearchParams,
  searchParamsToAPIParams,
  searchParamsToFilterValue,
  setFilterValueToSearchParams,
  setPaginationToSearchParams,
} from './searchParams';

describe('searchParams helpers', () => {
  describe('searchParamsToAPIParams', () => {
    it('should convert search params to API params', () => {
      const nowUTC = '2024-08-01T17:23:00.000Z';
      const first = `${faker.number.int()}`;
      const after = faker.string.uuid();

      const sp = new URLSearchParams();
      sp.append('from_date', 'custom');
      sp.append('from_date', nowUTC);
      sp.append('type', 'login_attempt');
      sp.append('type', 'resource_tagging');
      sp.append('first', first);
      sp.append('after', after);

      const result = searchParamsToAPIParams(sp);

      expect(result).toEqual({
        from_date: nowUTC,
        type: ['login_attempt', 'resource_tagging'],
        first,
        after,
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
      const first = faker.number.int();
      const after = faker.string.uuid();

      const filterValue = {
        from_date: ['custom', now],
        type: ['login_attempt', 'resource_tagging'],
        first,
        after,
      };

      const result = filterValueToSearchParams(filterValue);

      expect(result.getAll('from_date')).toEqual(['custom', utcNow]);
      expect(result.getAll('type')).toEqual([
        'login_attempt',
        'resource_tagging',
      ]);
      expect(result.get('first')).toEqual(`${first}`);
      expect(result.get('after')).toEqual(after);
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

  describe('setFilterValueToSearchParams', () => {
    it('should set filter value to empty search params', () => {
      const sp = new URLSearchParams();

      const result = setFilterValueToSearchParams(
        {
          type: ['login_attempt', 'resource_tagging'],
        },
        sp
      );

      expect(result.getAll('type')).toEqual([
        'login_attempt',
        'resource_tagging',
      ]);
      expect([...result.keys()]).toEqual(['type', 'type']);
    });

    it('should set filter value and preserve pagination (after/first)', () => {
      const first = faker.number.int();
      const after = faker.string.uuid();
      const sp = new URLSearchParams();
      sp.set('first', first);
      sp.set('after', after);

      const result = setFilterValueToSearchParams(
        {
          type: ['login_attempt', 'resource_tagging'],
        },
        sp
      );

      expect(result.getAll('type')).toEqual([
        'login_attempt',
        'resource_tagging',
      ]);
      expect(result.get('after')).toEqual(after);
      expect(result.get('first')).toEqual(`${first}`);
      expect([...result.keys()]).toEqual(['first', 'after', 'type', 'type']);
    });

    it('should set filter value and preserve pagination (before/last)', () => {
      const last = faker.number.int();
      const before = faker.string.uuid();
      const sp = new URLSearchParams();
      sp.set('last', last);
      sp.set('before', before);

      const result = setFilterValueToSearchParams(
        {
          type: ['login_attempt', 'resource_tagging'],
        },
        sp
      );

      expect(result.getAll('type')).toEqual([
        'login_attempt',
        'resource_tagging',
      ]);
      expect(result.get('before')).toEqual(before);
      expect(result.get('last')).toEqual(`${last}`);
      expect([...result.keys()]).toEqual(['last', 'before', 'type', 'type']);
    });

    it('should set override any filter', () => {
      const first = faker.number.int();
      const after = faker.string.uuid();
      const type1 = faker.string.alphanumeric(20);
      const utcNow = fromZonedTime(new Date()).toISOString();
      const sp = new URLSearchParams();
      sp.set('first', first);
      sp.set('after', after);
      sp.append('type', type1);
      sp.append('from_date', utcNow);

      const type2 = faker.string.alphanumeric(20);
      const type3 = faker.string.alphanumeric(20);
      const result = setFilterValueToSearchParams(
        {
          type: [type2, type3],
        },
        sp
      );

      expect(result.getAll('type')).toEqual([type2, type3]);
      expect(result.get('after')).toEqual(after);
      expect(result.get('first')).toEqual(`${first}`);
      expect([...result.keys()]).toEqual(['first', 'after', 'type', 'type']);
    });
  });

  describe('setPaginationToSearchParams', () => {
    it('should set pagination to empty search params', () => {
      const sp = new URLSearchParams();

      const newFirst = faker.number.int();
      const newAfter = faker.string.uuid();

      const result = setPaginationToSearchParams(
        {
          after: newAfter,
          first: newFirst,
        },
        sp
      );

      expect(result.get('after')).toEqual(newAfter);
      expect(result.get('first')).toEqual(`${newFirst}`);
      expect([...result.keys()]).toEqual(['after', 'first']);
    });

    it('should set pagination and preserve filter values', () => {
      const type = faker.string.alphanumeric(20);
      const utcNow = fromZonedTime(new Date()).toISOString();
      const sp = new URLSearchParams();
      sp.append('type', type);
      sp.append('from_date', 'custom');
      sp.append('from_date', utcNow);

      const newFirst = faker.number.int();
      const newAfter = faker.string.uuid();

      const result = setPaginationToSearchParams(
        {
          after: newAfter,
          first: newFirst,
        },
        sp
      );

      expect(result.get('after')).toEqual(newAfter);
      expect(result.get('first')).toEqual(`${newFirst}`);
      expect(result.getAll('type')).toEqual([type]);
      expect(result.getAll('from_date')).toEqual(['custom', utcNow]);
      expect([...result.keys()]).toEqual([
        'after',
        'first',
        'type',
        'from_date',
        'from_date',
      ]);
    });

    it('should override previous pagination', () => {
      const last = faker.number.int();
      const before = faker.string.uuid();
      const sp = new URLSearchParams();
      sp.set('last', last);
      sp.set('before', before);

      const newFirst = faker.number.int();
      const newAfter = faker.string.uuid();

      const result = setPaginationToSearchParams(
        {
          after: newAfter,
          first: newFirst,
        },
        sp
      );

      expect(result.get('after')).toEqual(newAfter);
      expect(result.get('first')).toEqual(`${newFirst}`);
      expect([...result.keys()]).toEqual(['after', 'first']);
    });
  });
});
