/* eslint-disable react/no-array-index-key */

import React, { Fragment, useState, useEffect } from 'react';
import { EOS_ARROW_UPWARD, EOS_ARROW_DOWNWARD } from 'eos-icons-react';
import classNames from 'classnames';
import { page, pages } from '@lib/lists';
import {
  getDefaultFilterFunction,
  createFilter,
  TableFilters,
} from './filters';

import CollapsibleTableRow from './CollapsibleTableRow';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { defaultRowKey } from './defaultRowKey';

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

function Table({
  config,
  data = [],
  sortBy,
  searchParams,
  setSearchParams,
  emptyStateText = 'No data available',
  withPadding = true,
  header = null,
  rowKey = defaultRowKey,
}) {
  const {
    columns,
    collapsibleDetailRenderer = undefined,
    rowClassName = '',
    collapsedRowClassName = '',
    pagination,
    usePadding = true,
  } = config;

  const [filters, setFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

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

      const filterFunction =
        typeof curr.filter === 'function'
          ? curr.filter(paramsFilterValue, curr.key)
          : getDefaultFilterFunction(paramsFilterValue, curr.key);

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
    .map(({ value, filterFunction }) => {
      if (value.length === 0) {
        return () => true;
      }

      return filterFunction;
    })
    .reduce((d, filterFunction) => d.filter(filterFunction), data);

  const sortedData = sortBy ? [...filteredData].sort(sortBy) : filteredData;

  const renderedData = pagination ? page(currentPage, sortedData) : sortedData;

  const totalPages = pages(sortedData);

  const displaySortIcons = ({
    sortable = false,
    sortDirection = undefined,
  }) => {
    if (!sortable) return null;

    if (sortDirection === 'asc')
      return (
        <span className="inline-table relative top-1">
          <EOS_ARROW_UPWARD />
        </span>
      );

    if (sortDirection === 'desc')
      return (
        <span className="inline-table relative top-1">
          <EOS_ARROW_DOWNWARD />
        </span>
      );

    return null;
  };

  return (
    <div
      className={classNames('container mx-auto', {
        'px-4 sm:px-8': usePadding,
      })}
    >
      <div className="flex items-center px-4 space-x-4">
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
      <div className="">
        <div
          className={classNames('-mx-4 sm:-mx-8 px-4 sm:px-8', {
            'pt-4': withPadding,
          })}
        >
          <div
            className={classNames(
              'min-w-fit shadow rounded-b-lg overflow-hidden',
              { 'rounded-t-lg': !hasFilters }
            )}
          >
            {header}
            <table className="min-w-full leading-normal table-fixed">
              <thead>
                <tr>
                  {columns.map(
                    ({
                      title,
                      className,
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
                              : null
                          }px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100`,
                          className
                        )}
                        onClick={handleClick}
                      >
                        {title} {displaySortIcons({ sortable, sortDirection })}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
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
                pages={totalPages}
                currentPage={currentPage}
                onSelect={(selectedPage) => setCurrentPage(selectedPage)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Table;
