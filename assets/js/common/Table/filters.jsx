import React from 'react';

import { uniq } from 'lodash';

import ComposedFilter from '@common/ComposedFilter';

export const createFilter = (
  filters,
  filterKey,
  filterValue,
  filterFunction
) => {
  const { found, filtersList } = filters.reduce(
    // shadowing in acc destructuring
    // eslint-disable-next-line
    ({ found, filtersList }, current) => {
      const { key } = current;
      return filterKey === key
        ? {
            found: true,
            filtersList: [
              ...filtersList,
              { key, value: filterValue, filterFunction },
            ],
          }
        : { found, filtersList: [...filtersList, current] };
    },
    { found: false, filtersList: [] }
  );

  return found
    ? filtersList
    : [...filtersList, { key: filterKey, value: filterValue, filterFunction }];
};

const mapToList = (map) =>
  Object.entries(map).map(([key, value]) => ({ key, value }));

const listToMap = (list) =>
  list.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});

const filterOptionsFromTableConfig = (config, data, value) =>
  config.columns
    .filter(({ filter }) => Boolean(filter))
    .map(({ key, title }) => {
      const filterValue = value[key];
      const filterOptions = uniq(
        data
          .map(({ [key]: option }) => option)
          .flat(Infinity)
          .concat(filterValue)
      );

      return {
        key,
        type: 'select',
        title,
        options: filterOptions,
      };
    });

export function TableFilters({ config, data, filters, onChange }) {
  const value = listToMap(filters);
  const filterOptions = filterOptionsFromTableConfig(config, data, value);
  return (
    <ComposedFilter
      filters={filterOptions}
      value={value}
      onChange={(newValue) => onChange(mapToList(newValue))}
      autoApply
    />
  );
}
