// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';

import { page, pages } from '@lib/lists';
import { changeSearchParams } from '@lib/searchParams';
import Button from '@common/Button';
import { Checkbox } from '@common/Input';
import Pagination, {
  PageStats,
  defaultItemsPerPage,
  defaultItemsPerPageOptions,
} from '@common/Pagination';
import { TableFilters } from './filters';
import { defaultRowKey } from './defaultRowKey';
import SortingIcon from './SortingIcon';
import EmptyState from './EmptyState';
import CollapsibleTableRow from './CollapsibleTableRow';

export const ITEMS_PER_PAGE_PARAM = 'itemsPerPage';

const defaultCellRender = (content) => (
  <p className="whitespace-no-wrap">{content}</p>
);

const renderCells = (columns, item) => (
  <>
    {columns.map(
      (
        { key, className, fontSize = 'text-sm', render = defaultCellRender },
        idx
      ) => {
        const content = item[key];
        return (
          <td
            key={idx}
            className={classNames(
              'px-5 py-5 border-b border-gray-200',
              className,
              fontSize
            )}
          >
            {render(content, item)}
          </td>
        );
      }
    )}
  </>
);

const updateSearchParams = (searchParams, values) => {
  values.forEach((f) => {
    searchParams.delete(f.key);

    f.value.forEach((v) => {
      searchParams.append(f.key, v);
    });
  });

  return searchParams;
};

const getDefaultFilterFunction = (filter, key) => (element) =>
  filter.includes(element[key]);

const getFilterFunction = (column, value) =>
  typeof column.filter === 'function'
    ? column.filter(value, column.key)
    : getDefaultFilterFunction(value, column.key);

const getRowClassName = (rowClassName, item) =>
  typeof rowClassName === 'function' ? rowClassName(item) : rowClassName;

const detectItemsPerPage = (value) =>
  defaultItemsPerPageOptions.includes(Number(value))
    ? Number(value)
    : defaultItemsPerPage;

function Table({
  className,
  config,
  data = [],
  sortBy,
  searchParams,
  setSearchParams,
  emptyStateText = 'No data available',
  header = null,
  rowKey = defaultRowKey,
  roundedTop = true,
  ariaLabelledBy,
  renderSelectionActions = noop,
}) {
  const {
    columns,
    selectable = false,
    collapsibleDetailRenderer = undefined,
    wrapCollapsedRowInCell = true,
    headerClassName = '',
    rowClassName = '',
    collapsedRowClassName = '',
    pagination,
    usePadding = true,
    onPageChange = noop,
  } = config;

  const [localFilters, setLocalFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [localItemsPerPage, setLocalItemsPerPage] =
    useState(defaultItemsPerPage);
  const [selectedKeys, setSelectedKeys] = useState(new Set());

  const searchParamsEnabled = Boolean(searchParams && setSearchParams);

  // When the table is bound to the search params, the items per page selection
  // lives in the URL, so that it can be persisted and shared
  const itemsPerPageBoundToParams = searchParamsEnabled && Boolean(pagination);

  const currentItemsPerPage = itemsPerPageBoundToParams
    ? detectItemsPerPage(searchParams.get(ITEMS_PER_PAGE_PARAM))
    : localItemsPerPage;

  const changeItemsPerPage = (perPage) => {
    setCurrentPage(1);

    if (!itemsPerPageBoundToParams) {
      setLocalItemsPerPage(perPage);
      return;
    }

    setSearchParams(changeSearchParams({ [ITEMS_PER_PAGE_PARAM]: perPage }), {
      replace: true,
    });
  };

  // Columns are bound to the search params only when the table itself is, so
  // that a table without them keeps every filter local
  const columnFiltersBoundToParams = searchParamsEnabled
    ? columns.filter((c) => c.filter && c.filterFromParams)
    : [];

  const hasFilters = columns.some(({ filter }) => Boolean(filter));

  const isBoundToParams = (filterKey) =>
    columnFiltersBoundToParams.some(({ key }) => key === filterKey);

  // The filters of the columns bound to the search params are read from the URL
  // rather than kept in state, so that the two never need to be synchronized
  const filters = [
    ...localFilters,
    ...columnFiltersBoundToParams
      .map(({ key }) => ({ key, value: searchParams.getAll(key) }))
      .filter(({ value }) => value.length > 0),
  ];

  const changeFilters = (newFilters) => {
    setCurrentPage(1);
    setLocalFilters(newFilters.filter(({ key }) => !isBoundToParams(key)));

    if (columnFiltersBoundToParams.length === 0) return;

    // Every bound column is written, so that the ones cleared in the meantime
    // are dropped from the URL
    const filtersBoundToParams = columnFiltersBoundToParams.map(({ key }) => ({
      key,
      value: newFilters.find((filter) => filter.key === key)?.value ?? [],
    }));

    setSearchParams(
      (prev) =>
        updateSearchParams(new URLSearchParams(prev), filtersBoundToParams),
      { replace: true }
    );
  };

  const filteredData = filters
    .map(({ key, value }) => {
      if (value.length === 0) {
        return () => true;
      }

      const column = config.columns.find((c) => c.key === key);

      const filterFunction = getFilterFunction(column, value);

      return filterFunction;
    })
    .reduce((d, filterFunction) => d.filter(filterFunction), data);

  const sortedData = sortBy ? [...filteredData].sort(sortBy) : filteredData;

  const totalPages = pages(sortedData, currentItemsPerPage);

  // The selected page can get out of range when the data or the items per page
  // change outside of the pagination controls, so it is always clamped
  const selectedPage = Math.min(currentPage, totalPages);

  const renderedData = pagination
    ? page(selectedPage, sortedData, currentItemsPerPage)
    : sortedData;

  useEffect(() => {
    onPageChange(renderedData);
  }, [selectedPage, renderedData.length]);

  // Selected keys of rows that do not exist anymore are ignored
  const keyByItem = new Map(
    data.map((item, index) => [item, rowKey(item, index)])
  );
  const renderedKeys = renderedData.map((item) => keyByItem.get(item));
  const filteredKeys = filteredData.map((item) => keyByItem.get(item));

  const isSelected = (key) => selectedKeys.has(key);
  const selectedItems = data.filter((item) => isSelected(keyByItem.get(item)));
  const selectedRenderedCount = renderedKeys.filter(isSelected).length;
  const selectedFilteredCount = filteredKeys.filter(isSelected).length;
  const allSelected =
    renderedKeys.length > 0 && selectedRenderedCount === renderedKeys.length;
  const someSelected = selectedRenderedCount > 0 && !allSelected;
  const selectionActive = selectedItems.length > 0;

  const selectKeys = (keys) =>
    setSelectedKeys((prev) => new Set([...prev, ...keys]));

  const deselectKeys = (keys) =>
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => next.delete(key));
      return next;
    });

  const toggleAllRows = () =>
    allSelected ? deselectKeys(renderedKeys) : selectKeys(renderedKeys);

  const toggleRow = (key) =>
    isSelected(key) ? deselectKeys([key]) : selectKeys([key]);

  const extraColumns =
    (collapsibleDetailRenderer ? 1 : 0) + (selectable ? 1 : 0);

  return (
    <div
      className={classNames(className, 'container mx-auto', {
        'px-4 sm:px-8': usePadding,
      })}
    >
      {hasFilters && (
        <div className={classNames('flex-row px-4 space-x-4 pb-4')}>
          <TableFilters
            config={config}
            data={data}
            filters={filters}
            onChange={changeFilters}
          />
        </div>
      )}
      <div className="">
        <div
          className={classNames('-mx-4 sm:-mx-8 px-4 sm:px-8', {
            'pt-4': usePadding,
          })}
        >
          <div
            className={classNames(
              'min-w-fit shadow overflow-hidden rounded-b-lg',
              {
                'rounded-t-lg': !hasFilters && roundedTop,
              }
            )}
          >
            {selectionActive && (
              <div className="flex items-center justify-between px-5 py-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500">
                    {selectedItems.length} of {data.length} selected
                  </span>
                  {selectedFilteredCount < filteredKeys.length && (
                    <Button
                      type="link"
                      size="fit"
                      onClick={() => selectKeys(filteredKeys)}
                    >
                      Select all {filteredKeys.length} items
                    </Button>
                  )}
                  {selectedFilteredCount > 0 && (
                    <Button
                      type="link"
                      size="fit"
                      onClick={() => deselectKeys(filteredKeys)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {renderSelectionActions(selectedItems)}
              </div>
            )}
            {header}
            <table
              className="min-w-full leading-normal table-fixed"
              aria-labelledby={ariaLabelledBy}
            >
              <thead>
                <tr>
                  {selectable && (
                    <th
                      key="selection"
                      scope="col"
                      className={classNames(
                        'w-10 pl-5 border-b bg-gray-100',
                        headerClassName
                      )}
                    >
                      <Checkbox
                        aria-label="Select all rows"
                        checked={allSelected}
                        indeterminate={someSelected}
                        disabled={renderedKeys.length === 0}
                        onChange={toggleAllRows}
                      />
                    </th>
                  )}
                  {collapsibleDetailRenderer && (
                    <th
                      key="collapsible"
                      scope="col"
                      className={classNames(
                        'w-6 border-b bg-gray-100',
                        headerClassName
                      )}
                      aria-label="collapsible"
                    />
                  )}
                  {columns.map(
                    ({
                      title,
                      className: columnClassName,
                      sortable = false,
                      sortDirection = undefined,
                      handleClick = () => {},
                    }) => (
                      <th
                        key={title}
                        scope="col"
                        className={classNames(
                          `${
                            sortable
                              ? 'cursor-pointer hover:text-gray-700 '
                              : ''
                          }px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b bg-gray-100`,
                          headerClassName,
                          columnClassName
                        )}
                        onClick={handleClick}
                      >
                        {title}{' '}
                        <SortingIcon
                          sortable={sortable}
                          sortDirection={sortDirection}
                        />
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white text-gray-900">
                {renderedData.length === 0 ? (
                  <EmptyState
                    colSpan={columns.length + extraColumns}
                    emptyStateText={emptyStateText}
                  />
                ) : (
                  renderedData.map((item, index) => {
                    const key = renderedKeys[index];

                    return (
                      <CollapsibleTableRow
                        item={item}
                        key={key}
                        collapsibleDetailRenderer={collapsibleDetailRenderer}
                        wrapCollapsedRowInCell={wrapCollapsedRowInCell}
                        renderCells={renderCells}
                        columns={columns}
                        colSpan={columns.length + (selectable ? 1 : 0)}
                        selectable={selectable}
                        selected={isSelected(key)}
                        onSelect={() => toggleRow(key)}
                        className={getRowClassName(rowClassName, item)}
                        collapsedRowClassName={collapsedRowClassName}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
            {pagination && (
              <Pagination
                hasPrev={selectedPage > 1}
                hasNext={selectedPage < totalPages}
                currentItemsPerPage={currentItemsPerPage}
                onSelect={(selection) => {
                  switch (selection) {
                    case 'prev':
                      setCurrentPage(selectedPage - 1);
                      break;
                    case 'next':
                      setCurrentPage(selectedPage + 1);
                      break;
                    case 'first':
                      setCurrentPage(1);
                      break;
                    case 'last':
                      setCurrentPage(totalPages);
                      break;
                    default:
                  }
                }}
                onChangeItemsPerPage={changeItemsPerPage}
                pageStats={
                  <PageStats
                    selectedPage={selectedPage}
                    itemsPresent={renderedData.length}
                    itemsTotal={filteredData.length}
                    currentItemsPerPage={currentItemsPerPage}
                  />
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Table;
