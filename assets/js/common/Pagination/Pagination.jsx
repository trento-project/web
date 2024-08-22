import React from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';

import Select from '@common/Select';

const getPagesArray = (pages) => Array.from({ length: pages }, (_, i) => 1 + i);

function Pagination({
  pages,
  currentPage,
  onSelect,
  currentItemsPerPage = 10,
  itemsPerPageOptions = [10],
  onChangeItemsPerPage = noop,
}) {
  const pagesList = getPagesArray(pages);

  // Can happen if the items per page get changed, while being on the last
  // page
  if (currentPage > pages) {
    // "what if pages is 0?"
    // otherwise the user is always staying at page 0
    onSelect(pages || 1);
  }

  return (
    <div className="flex justify-between p-2 bg-gray-50 width-full">
      {itemsPerPageOptions.length > 1 ? (
        <div className="flex pl-3 items-center text-sm">
          <span className="pr-2 text-gray-600">Results per page</span>
          <Select
            className="z-40"
            optionsName=""
            options={itemsPerPageOptions}
            value={currentItemsPerPage}
            onChange={onChangeItemsPerPage}
          />
        </div>
      ) : (
        <span />
      )}
      <div className="flex items-center">
        {pagesList.map((pageNumber) => {
          const isFirst = pageNumber === 1;
          const isLast = pageNumber === pages;
          const classes = classNames(
            'tn-page-item',
            'w-full',
            'px-4',
            'py-2',
            'text-xs',
            'bg-white',
            'hover:bg-gray-100',
            {
              'rounded-l-lg': isFirst,
              'rounded-r-lg': isLast,
              'border-l': isFirst,
              'border-r': isLast,
              'text-gray-600': currentPage !== pageNumber,
              'text-jungle-green-500': currentPage === pageNumber,
              border: pageNumber % 2 === 0,
              'border-t': pageNumber % 2 === 1,
              'border-b': pageNumber % 2 === 1,
            }
          );

          return (
            <button
              key={pageNumber}
              type="button"
              className={classes}
              onClick={() => onSelect(pageNumber)}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Pagination;
