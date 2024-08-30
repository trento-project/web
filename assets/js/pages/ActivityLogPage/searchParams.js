/**
 * This module exposes helper functions to handle query search parameters
 */

import { uniq } from 'lodash';
import { pipe, map, reduce, defaultTo, omit } from 'lodash/fp';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

const paginationFields = ['after', 'before', 'first', 'last'];
const scalarKeys = [...paginationFields];

const omitUndefined = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => typeof v !== 'undefined')
  );

const searchParamsToEntries = (searchParams) =>
  pipe(Array.from, uniq, (keys) =>
    keys.map((key) => [
      key,
      scalarKeys.includes(key)
        ? searchParams.get(key)
        : searchParams.getAll(key),
    ])
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

const structToSearchParams = pipe(
  omitUndefined,
  Object.entries,
  reduce((acc, [k, v]) => {
    const sp = acc || new URLSearchParams();
    if (scalarKeys.includes(k)) {
      sp.set(k, v);
    } else {
      Array.from(v).forEach((value) => sp.append(k, value));
    }
    return sp;
  }, null),
  defaultTo(new URLSearchParams())
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
        return [k, [v[0], fromZonedTime(new Date(v[1])).toISOString()]];
      default:
        return [k, v];
    }
  }),
  reduce((acc, [k, v]) => {
    const sp = acc || new URLSearchParams();
    if (scalarKeys.includes(k)) {
      sp.set(k, v);
    } else {
      Array.from(v).forEach((value) => sp.append(k, value));
    }
    return sp;
  }, null),
  defaultTo(new URLSearchParams())
);

export const paginatorToFilterValues =
  (paginationMetadata) =>
  (selection, itemsPerPage = paginationMetadata.first) => ({
    ...(selection === 'prev'
      ? { before: paginationMetadata.start_cursor }
      : {}),
    ...(selection === 'next' ? { after: paginationMetadata.end_cursor } : {}),
    first: itemsPerPage,
  });

export const setPaginationToSearchParams = (
  pagination,
  searchParams = new URLSearchParams()
) => {
  // eslint-disable-next-line no-unused-vars
  const filters = pipe(
    searchParamsToEntries,
    Object.fromEntries,
    omit(paginationFields)
  )(searchParams);

  return filterValueToSearchParams({ ...pagination, ...filters });
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

export const resetPaginationToSearchParams =
  (itemsPerPage) =>
  (searchParams = new URLSearchParams()) => {
    // eslint-disable-next-line no-unused-vars
    const filters = pipe(
      searchParamsToEntries,
      Object.fromEntries,
      omit(paginationFields)
    )(searchParams);

    return structToSearchParams({ first: itemsPerPage, ...filters });
  };
