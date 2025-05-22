/* eslint-disable react/no-array-index-key */

import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';

import { page, pages } from '@lib/lists';
import Pagination, { PageStats } from '@common/Pagination';
import { TableFilters, createFilter } from './filters';
import { defaultRowKey } from './defaultRowKey';
import SortingIcon from './SortingIcon';
import EmptyState from './EmptyState';
import CollapsibleTableRow from './CollapsibleTableRow';

const defaultCellRender = (content) => (
  <p className="text-gray-900 whitespace-no-wrap">{content}</p>
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
              'px-5 py-5 border-b border-gray-200 bg-white',
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

const itemsPerPageOptions = [10, 20, 50, 75, 100];

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
}) {
  const {
    columns,
    collapsibleDetailRenderer = undefined,
    rowClassName = '',
    collapsedRowClassName = '',
    pagination,
    usePadding = true,
    onPageChange = noop,
  } = config;

  const [filters, setFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(
    itemsPerPageOptions[0]
  );

  const searchParamsEnabled = Boolean(searchParams && setSearchParams);

  const columnFiltersBoundToParams = columns.filter(
    (c) => c.filter && c.filterFromParams
  );

  const hasFilters = columns.filter(({ filter }) => Boolean(filter)).length > 0;

  useEffect(() => {
    if (!searchParamsEnabled) return;
    const filtersBoundToQs = filters.reduce((acc, curr) => {
      const isFilterBoundToQs = columnFiltersBoundToParams.find(
        (col) => col.key === curr.key
      );

      if (!isFilterBoundToQs) return [...acc];

      return [...acc, { key: curr.key, value: curr.value }];
    }, []);

    setSearchParams(updateSearchParams(searchParams, filtersBoundToQs));
  }, [filters, searchParams]);

  useEffect(() => {
    if (!searchParamsEnabled) return;
    const filterFromQs = columnFiltersBoundToParams.reduce((acc, curr) => {
      const paramsFilterValue = searchParams.getAll(curr.key);

      if (paramsFilterValue.length === 0) return [...acc];

      const filterFunction = getFilterFunction(curr, paramsFilterValue);

      return [
        ...acc,
        ...createFilter(filters, curr.key, paramsFilterValue, filterFunction),
      ];
    }, []);

    if (filterFromQs.length) {
      setFilters(filterFromQs);
    }
  }, [searchParams]);

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

  const renderedData = pagination
    ? page(currentPage, sortedData, currentItemsPerPage)
    : sortedData;

  useEffect(() => {
    onPageChange(renderedData);
  }, [currentPage, renderedData.length]);

  const totalPages = pages(sortedData, currentItemsPerPage);

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
            onChange={(newFilters) => {
              setFilters(newFilters);
              setCurrentPage(1);
            }}
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
            {header}
            <table className="min-w-full leading-normal table-fixed">
              <thead>
                <tr>
                  {columns.map(
                    ({
                      title,
                      columnClassName,
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
                          }px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100`,
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
              <tbody>
                {renderedData.length === 0 ? (
                  <EmptyState
                    colSpan={columns.length}
                    emptyStateText={emptyStateText}
                  />
                ) : (
                  renderedData.map((item, index) => {
                    const key = rowKey(item, index);

                    return (
                      <CollapsibleTableRow
                        item={item}
                        key={key}
                        collapsibleDetailRenderer={collapsibleDetailRenderer}
                        renderCells={renderCells}
                        columns={columns}
                        colSpan={columns.length}
                        className={rowClassName}
                        collapsedRowClassName={collapsedRowClassName}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
            {pagination && (
              <Pagination
                hasPrev={currentPage > 1}
                hasNext={currentPage < totalPages}
                currentItemsPerPage={currentItemsPerPage}
                onSelect={(selection) => {
                  switch (selection) {
                    case 'prev':
                      setCurrentPage(currentPage - 1);
                      break;
                    case 'next':
                      setCurrentPage(currentPage + 1);
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
                onChangeItemsPerPage={(perPage) => {
                  setCurrentItemsPerPage(perPage);
                  setCurrentPage(1);
                }}
                pageStats={
                  <PageStats
                    selectedPage={Math.min(currentPage, totalPages)}
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
