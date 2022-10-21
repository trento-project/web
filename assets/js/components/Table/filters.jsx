import React from 'react';

import { uniq } from '@lib/lists';

import Filter from './Filter';

export const getDefaultFilterFunction = (filter, key) => (element) => {
  return filter.includes(element[key]);
};

export const createFilter = (
  filters,
  filterKey,
  filterValue,
  filterFunction
) => {
  const { found, filtersList } = filters.reduce(
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

const getFilter = (key, list) =>
  list.reduce(
    (accumulator, current) =>
      current.key === key && accumulator.length === 0
        ? current.value
        : accumulator,
    []
  );

export const TableFilters = ({ config, data, filters, onChange }) => {
  return config.columns
    .filter(({ filter }) => Boolean(filter))
    .map((column) => {
      const filterValue = getFilter(column.key, filters);
      const filterOptions = uniq(
        data
          .map(({ [column.key]: option }) => option)
          .flat(Infinity)
          .concat(filterValue)
      );

      return (
        <Filter
          key={column.key}
          title={column.title}
          options={filterOptions}
          value={filterValue}
          onChange={(list) => {
            const filterFunction =
              typeof column.filter === 'function'
                ? column.filter(list, column.key)
                : getDefaultFilterFunction(list, column.key);

            onChange(createFilter(filters, column.key, list, filterFunction));
          }}
        />
      );
    });
};
