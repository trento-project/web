import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import { getDefaultFilterFunction, createFilter } from './filters';
import { page, pages } from '@lib/lists';

import CollapsibleTableRow from './CollapsibleTableRow';
import { TableFilters } from './filters';
import Pagination from './Pagination';
import { useEffect } from 'react';

const defaultCellRender = (content) => (
  <p className="text-gray-900 whitespace-no-wrap">{content}</p>
);

const renderCells = (columns, item) => {
  return (
    <Fragment>
      {columns.map(({ key, className, render = defaultCellRender }, idx) => {
        const content = item[key];
        return (
          <td
            key={idx}
            className={classNames(
              'px-5 py-5 border-b border-gray-200 bg-white text-sm',
              className
            )}
          >
            {render(content, item)}
          </td>
        );
      })}
    </Fragment>
  );
};

const updateSearchParams = (searchParams, values) => {
  values.forEach((f) => {
    searchParams.delete(f.key);

    f.value.forEach((v) => {
      searchParams.append(f.key, v);
    });
  });

  return searchParams;
};

const Table = ({ config, data = [], searchParams, setSearchParams }) => {
  const {
    columns,
    collapsibleDetailRenderer = undefined,
    pagination,
    usePadding = true,
  } = config;

  const [filters, setFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const searchParamsEnabled = Boolean(searchParams && setSearchParams);

  const columnFiltersBoundToParams = columns.filter(
    (c) => c.filter && c.filterFromParams
  );

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
    .reduce((data, filterFunction) => {
      return data.filter(filterFunction);
    }, data);

  const totalPages = pages(filteredData);

  const renderedData = pagination
    ? page(currentPage, filteredData)
    : filteredData;

  return (
    <div
      className={classNames('container mx-auto', {
        'px-4 sm:px-8': usePadding,
      })}
    >
      <div className="flex items-center">
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
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4">
          <div className="min-w-fit shadow rounded-lg">
            <table className="min-w-full leading-normal table-fixed">
              <thead>
                <tr>
                  {columns.map(({ title, className }) => (
                    <th
                      key={title}
                      scope="col"
                      className={classNames(
                        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                        className
                      )}
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderedData.map((item, index) => (
                  <CollapsibleTableRow
                    item={item}
                    key={index}
                    collapsibleDetailRenderer={collapsibleDetailRenderer}
                    renderCells={renderCells}
                    columns={columns}
                    colSpan={columns.length}
                  />
                ))}
              </tbody>
            </table>
            {pagination && (
              <Pagination
                pages={totalPages}
                currentPage={currentPage}
                onSelect={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
