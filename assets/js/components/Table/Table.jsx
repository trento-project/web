import React, { Fragment } from 'react';

const defaultCellRender = (content) => (
  <p className="text-gray-900 whitespace-no-wrap">{content}</p>
);

const renderCells = (columns, item) => {
  return (
    <Fragment>
      {columns.map(({ title, key, render = defaultCellRender }) => {
        const content = item[key];
        return (
          <td
            key={key}
            className="px-5 py-5 border-b border-gray-200 bg-white text-sm"
          >
            {render(content)}
          </td>
        );
      })}
    </Fragment>
  );
};

const Table = ({ config, data = [] }) => {
  const { columns } = config;

  return (
    <div className="container mx-auto px-4 sm:px-8 max-w-3xl">
      <div className="py-8">
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  {columns.map(({ title }) => (
                    <th
                      key={title}
                      scope="col"
                      className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
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
