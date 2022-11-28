import React from 'react';
import classNames from 'classnames';

const getPagesArray = (pages) => Array.from({ length: pages }, (_, i) => 1 + i);

function Pagination({ pages, currentPage, onSelect }) {
  const pagesList = getPagesArray(pages);
  return (
    <div className="grid py-2">
      <div className="justify-self-end pr-2">
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
              },
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
    </div>
  );
}

export default Pagination;
