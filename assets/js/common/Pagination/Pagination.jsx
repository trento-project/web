import React from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';
import ReactPaginate from 'react-paginate';

import Select from '@common/Select';

function Pagination({
  pages,
  currentPage,
  onSelect,
  currentItemsPerPage = 10,
  itemsPerPageOptions = [10],
  onChangeItemsPerPage = noop,
}) {
  const selectedPage = Math.min(currentPage, pages);

  const boxStyle = classNames(
    'tn-page-item',
    'w-full',
    'px-4',
    'py-2',
    'text-xs',
    'bg-white',
    'border-t',
    'border-b',
    'border-l',
    'hover:bg-gray-100'
  );

  return (
    <div
      className="flex justify-between p-2 bg-gray-50 width-full"
      data-testid="pagination"
    >
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

      {/* ReactPaginate paged are 0-based */}
      <ReactPaginate
        forcePage={selectedPage - 1}
        pageRangeDisplayed={3}
        marginPagesDisplayed={1}
        breakLabel="..."
        nextLabel=">"
        onClick={(e) => {
          const selected =
            typeof e.nextSelectedPage === 'number'
              ? e.nextSelectedPage
              : e.selected;
          onSelect(selected + 1);
        }}
        pageCount={pages}
        previousLabel="<"
        renderOnZeroPageCount={null}
        containerClassName="flex items-center"
        pageClassName={boxStyle}
        activeLinkClassName="text-gray-600 text-jungle-green-500"
        previousClassName={classNames(boxStyle, 'rounded-l-lg')}
        nextClassName={classNames(boxStyle, 'border-r', 'rounded-r-lg')}
        breakClassName={boxStyle}
      />
    </div>
  );
}

export default Pagination;
