/**
 * This module exposes helper functions to handle query search parameters
 */

import { uniq } from 'lodash';
import { pipe, map, reduce, defaultTo } from 'lodash/fp';
import { format as formatDate, toZonedTime } from 'date-fns-tz';

const toUTC = (date) => formatDate(date, "yyyy-MM-dd'T'HH:mm:ss.000'Z'");

const omitUndefined = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => typeof v !== 'undefined')
  );

const searchParamsToEntries = (searchParams) =>
  pipe(Array.from, uniq, (keys) =>
    keys.map((key) => [key, searchParams.getAll(key)])
  )(searchParams.keys());

/**
 * Convert a search params object to an API params object as expected by the API client
 * Make the necessary transformations to the values before setting them in the search params
 */
export const searchParamsToAPIParams = pipe(
  searchParamsToEntries,
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
        return [k, [v[0], toZonedTime(new Date(v[1]))]];
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
  reduce((acc, [k, v]) => {
    const sp = acc || new URLSearchParams();
    Array.from(v).forEach((value) => sp.append(k, value));
    return sp;
  }, null),
  defaultTo(new URLSearchParams())
);
