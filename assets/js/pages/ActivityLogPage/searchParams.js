/**
 * This module exposes helper functions to handle query search parameters
 */

import { uniq } from 'lodash';
import { pipe, map, reduce, defaultTo, omit, filter } from 'lodash/fp';
import { format as formatDate, toZonedTime } from 'date-fns-tz';

const toUTC = (date) => formatDate(date, "yyyy-MM-dd'T'HH:mm:ss.000'Z'");

const omitUndefined = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => typeof v !== 'undefined')
  );

const paginationFields = ['after', 'before', 'first', 'last'];
const scalarKeys = [...paginationFields, 'search', 'severity'];
const ignoreKeys = ['refreshRate'];

const searchParamsToEntries = (searchParams) =>
  pipe(Array.from, uniq, (keys) =>
    keys.map((key) => [
      key,
      scalarKeys.includes(key)
        ? searchParams.get(key)
        : searchParams.getAll(key),
    ])
  )(searchParams.keys());

const entriesToSearchParams = (entries) =>
  entries.length
    ? entries.reduce((sp, [k, v]) => {
        scalarKeys.includes(k)
          ? sp.set(k, v)
          : Array.from(v).forEach((value) => sp.append(k, value));
        return sp;
      }, new URLSearchParams())
    : new URLSearchParams();

const ignoreIrrelevantEntries = pipe(
  Object.fromEntries,
  omit(ignoreKeys),
  Object.entries
);

/**
 * Convert a search params object to an API params object as expected by the API client
 * Make the necessary transformations to the values before setting them in the search params
 */
export const searchParamsToAPIParams = pipe(
  searchParamsToEntries,
  ignoreIrrelevantEntries,
  map(([key, value]) => {
    switch (key) {
      case 'from_date':
      case 'to_date':
        return [key, new Date(value[1]).toISOString()];
      default:
        return [key, value];
    }
  }),
  Object.fromEntries
);

/**
 * Convert a search params object to a filter value object as expected by the ComposedFilter component
 * Make the necessary transformations to the values before setting them in the search params
 */
export const searchParamsToFilterValue = pipe(
  searchParamsToEntries,
  map(([k, v]) => {
    switch (k) {
      case 'from_date':
      case 'to_date':
        return [k, [v[0], toZonedTime(v[1])]];
      default:
        return [k, v];
    }
  }),
  Object.fromEntries
);

/**
 * Convert a filter value object to a search params object as expected by the URLSearchParams API
 * Make the necessary transformations to the values before setting them in the search params
 */
export const filterValueToSearchParams = pipe(
  omitUndefined,
  Object.entries,
  map(([k, v]) => {
    switch (k) {
      case 'from_date':
      case 'to_date':
        return [k, [v[0], toUTC(new Date(v[1]))]];
      default:
        return [k, v];
    }
  }),
  entriesToSearchParams,
  defaultTo(new URLSearchParams())
);

export const structToSearchParams = pipe(
  omitUndefined,
  Object.entries,
  entriesToSearchParams,
  defaultTo(new URLSearchParams())
);

export const setPaginationToSearchParams =
  (searchParams = new URLSearchParams()) =>
  (pagination) => {
    // eslint-disable-next-line no-unused-vars
    const filters = pipe(
      searchParamsToEntries,
      Object.fromEntries,
      omit(paginationFields)
    )(searchParams);

    const v = structToSearchParams({ ...pagination, ...filters });
    return v;
  };

export const setFilterValueToSearchParams = (
  filterValue,
  searchParams = new URLSearchParams()
) =>
  pipe(
    searchParamsToEntries,
    reduce(
      (acc, [k, v]) =>
        paginationFields.includes(k) ? { ...acc, [k]: v } : acc,
      {}
    ),
    (x) => ({ ...x, ...filterValue }),
    filterValueToSearchParams
  )(searchParams);

export const getItemsPerPageFromSearchParams = (searchParams) =>
  Number(searchParams.get('first') || searchParams.get('last'));

export const applyItemsPerPage = (itemsPerPage) => (searchParams) => {
  searchParams.set('first', itemsPerPage);

  return searchParams;
};

export const resetPaginationToSearchParams = pipe(
  searchParamsToEntries,
  filter(([k]) => !paginationFields.includes(k)),
  entriesToSearchParams
);
