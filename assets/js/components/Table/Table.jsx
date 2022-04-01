import React, { Fragment, useState } from 'react';
import classNames from 'classnames';

import { page, pages } from '@lib/lists';

import CollapsibleTableRow from './CollapsibleTableRow';
import { TableFilters } from './filters';
import Pagination from './Pagination';

const defaultCellRender = (content) => (
  <p className="text-gray-900 whitespace-no-wrap">{content}</p>
);

const renderCells = (columns, item) => {
  return (
    <Fragment>
      {columns.map(({ key, className, render = defaultCellRender }) => {
        const content = item[key];
        return (
          <td
            key={key}
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

const Table = ({ config, data = [] }) => {
  const {
    columns,
    collapsibleDetailRenderer = undefined,
    pagination,
    usePadding = true,
  } = config;

  const [filters, setFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

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
          }}
        />
      </div>
      <div className="py-4">
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4">
          <div className="min-w-fit shadow rounded-lg">
            <table className="min-w-full leading-normal">
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
