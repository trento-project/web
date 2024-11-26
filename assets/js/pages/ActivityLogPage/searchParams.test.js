import {
  filterValueToSearchParams,
  searchParamsToAPIParams,
  searchParamsToFilterValue,
  setPaginationToSearchParams,
} from './searchParams';

describe('searchParams helpers', () => {
  describe('searchParamsToAPIParams', () => {
    it('should convert search params to API params', () => {
      const nowUTC = '2024-08-01T17:23:00.000Z';

      const sp = new URLSearchParams();
      sp.append('from_date', 'custom');
      sp.append('from_date', nowUTC);
      sp.append('type', 'login_attempt');
      sp.append('type', 'resource_tagging');
      sp.append('search', 'foo+bar');

      const result = searchParamsToAPIParams(sp);

      expect(result).toEqual({
        from_date: nowUTC,
        type: ['login_attempt', 'resource_tagging'],
        search: 'foo+bar',
      });
    });

    it('should ignore irrelevant entries', () => {
      const sp = new URLSearchParams();
      sp.append('search', 'foo+bar');
      sp.append('refreshRate', '5000');

      const result = searchParamsToAPIParams(sp);

      expect(result).toEqual({ search: 'foo+bar' });
    });
  });

  describe('searchParamsToFilterValue', () => {
    it('should convert search params to filter value', () => {
      const nowUTC = '2024-08-01T17:23:00.000Z';
      const now = new Date(nowUTC);

      const sp = new URLSearchParams();
      sp.append('from_date', 'custom');
      sp.append('from_date', nowUTC);
      sp.append('type', 'login_attempt');
      sp.append('type', 'resource_tagging');
      sp.append('search', 'foo+bar');

      const result = searchParamsToFilterValue(sp);

      expect(result).toEqual({
        from_date: ['custom', expect.any(Date)],
        type: ['login_attempt', 'resource_tagging'],
        search: 'foo+bar',
      });

      expect(result.from_date[1].getTime()).toEqual(
        now.getTime() + now.getTimezoneOffset() * 60 * 1000
      );
    });
  });

  describe('filterValueToSearchParams', () => {
    it('should convert filter value to search params', () => {
      const base = '2024-08-14T10:21:00';
      const utcNow = `${base}.000Z`;
      const now = new Date(base);

      const filterValue = {
        from_date: ['custom', now],
        type: ['login_attempt', 'resource_tagging'],
        search: 'foo+bar',
      };

      const result = filterValueToSearchParams(filterValue);

      expect(result.getAll('from_date')).toEqual(['custom', utcNow]);
      expect(result.getAll('type')).toEqual([
        'login_attempt',
        'resource_tagging',
      ]);
      expect(result.get('search')).toEqual('foo+bar');
    });

    it('should use a fresh URLSearchParams instance', () => {
      const base = '2024-08-14T10:21:00';
      const utcNow = `${base}.000Z`;
      const now = new Date(base);

      const filterValue = {
        from_date: ['custom', now],
        type: ['login_attempt', 'resource_tagging'],
        search: 'foo+bar',
      };

      // apply two times to test if the function is using a fresh URLSearchParams instance
      /*          */ filterValueToSearchParams(filterValue);
      const result = filterValueToSearchParams(filterValue);

      expect(result.getAll('from_date')).toEqual(['custom', utcNow]);
      expect(result.getAll('type')).toEqual([
        'login_attempt',
        'resource_tagging',
      ]);
      expect(result.get('search')).toEqual('foo+bar');
    });

    it('should return an instance of URLSearchParams when filters are empty', () => {
      const filterValue = {};

      const result = filterValueToSearchParams(filterValue);

      expect(result).toEqual(expect.any(URLSearchParams));
    });
  });

  describe('setPaginationToSearchParams', () => {
    it('should set pagination on empty search params object', () => {
      const sp = new URLSearchParams();
      const pagination = { first: 20, after: 'sds' };

      const newSp = setPaginationToSearchParams(sp)(pagination);

      expect(newSp.get('first')).toEqual('20');
      expect(newSp.get('after')).toEqual('sds');
      expect([...newSp.keys()]).toEqual(['first', 'after']);
    });

    it('should override pagination if present', () => {
      const sp = new URLSearchParams();
      sp.set('last', '10');
      sp.set('before', 'abc');
      const pagination = { first: 20, after: 'sds' };

      const newSp = setPaginationToSearchParams(sp)(pagination);

      expect(newSp.get('first')).toEqual('20');
      expect(newSp.get('after')).toEqual('sds');
      expect([...newSp.keys()]).toEqual(['first', 'after']);
    });

    it('should preserve filters if present', () => {
      const sp = new URLSearchParams();
      sp.append('type', 'login_attempt');
      sp.append('type', 'resource_tagging');
      const pagination = { first: 20, after: 'sds' };

      const newSp = setPaginationToSearchParams(sp)(pagination);

      expect(newSp.get('first')).toEqual('20');
      expect(newSp.get('after')).toEqual('sds');
      expect(newSp.getAll('type')).toEqual([
        'login_attempt',
        'resource_tagging',
      ]);
      expect([...newSp.keys()]).toEqual(['first', 'after', 'type', 'type']);
    });
  });
});
