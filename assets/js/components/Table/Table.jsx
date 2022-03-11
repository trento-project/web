import React, { Fragment, useState } from 'react';

import { TableFilters } from './filters';

const defaultCellRender = (content) => (
  <p className="text-gray-900 whitespace-no-wrap">{content}</p>
);

const renderCells = (columns, item) => {
  return (
    <Fragment>
      {columns.map(({ key, render = defaultCellRender }) => {
        const content = item[key];
        return (
          <td
            key={key}
            className="px-5 py-5 border-b border-gray-200 bg-white text-sm"
          >
            {render(content, item)}
          </td>
        );
      })}
    </Fragment>
  );
};

const Table = ({ config, data = [] }) => {
  const { columns } = config;
  const [filters, setFilters] = useState([]);

  const renderedData = filters
    .map(({ value, filterFunction }) => {
      if (value.length === 0) {
        return () => true;
      }
      return filterFunction;
    })
    .reduce((data, filterFunction) => {
      return data.filter(filterFunction);
    }, data);

  return (
    <div className="container mx-auto px-4 sm:px-8 max-w-4xl">
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
      <div className="py-8">
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4">
          <div className="inline-block min-w-fit shadow rounded-lg">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  {columns.map(({ title }) => (
                    <th
                      key={title}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderedData.map((item, index) => (
                  <tr key={index}>{renderCells(columns, item)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
