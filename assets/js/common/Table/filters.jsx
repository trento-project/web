// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { uniq } from 'lodash';

import ComposedFilter from '@common/ComposedFilter';

const mapToList = (map) =>
  Object.entries(map).map(([key, value]) => ({ key, value }));

const listToMap = (list) =>
  list.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});

const filterOptionsFromTableConfig = (config, data, value) =>
  config.columns
    .filter(({ filter }) => Boolean(filter))
    .map(({ key, title, filterOptionsSorter = () => 1 }) => {
      const filterValue = value[key];
      const filterOptions = uniq(
        data
          .map(({ [key]: option }) => option)
          .flat(Infinity)
          .concat(filterValue)
          .sort(filterOptionsSorter)
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
