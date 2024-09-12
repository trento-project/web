import React from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';
import ReactPaginate from 'react-paginate';

import Select from '@common/Select';

const PREV_LABEL = '<';
const NEXT_LABEL = '>';

const boxClassNames = classNames(
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

const leftBoxClassNames = classNames(boxClassNames, 'rounded-l-lg');
const rightBoxClassNames = classNames(
  boxClassNames,
  'border-r',
  'rounded-r-lg'
);
const activeLinkClassNames = 'text-jungle-green-500';
const disabledLinkClassNames = classNames(
  'text-zinc-400',
  'hover:bg-white',
  'cursor-default'
);
const containerClassNames = 'flex items-center';

const defaultItemsPerPageOptions = [10, 20, 50, 75, 100];
const defaultItemsPerPage = 10;

function ItemsOnPageStats({
  currentItemsPerPage,
  itemsPresent,
  itemsTotal,
  selectedPage,
}) {
  const itemsBase = (selectedPage - 1) * currentItemsPerPage;
  const lowerBound = itemsBase + 1;
  const upperBound = itemsBase + itemsPresent;

  return (
    <span className="mr-4 text-gray-600">
      {lowerBound}–{upperBound} of {itemsTotal}
    </span>
  );
}

function ItemsPerPageSelector({
  itemsPerPageOptions = defaultItemsPerPageOptions,
  currentItemsPerPage,
  onChange,
}) {
  return (
    itemsPerPageOptions.length > 1 && (
      <div className="flex pl-3 items-center text-sm">
        <span className="pr-2 text-gray-600">Results per page</span>
        <Select
          className="z-40"
          optionsName=""
          options={itemsPerPageOptions}
          value={currentItemsPerPage}
          onChange={onChange}
        />
      </div>
    )
  );
}

function PaginationPrevNext({
  hasPrev = true,
  hasNext = true,
  onSelect,
  currentItemsPerPage = defaultItemsPerPage,
  itemsPerPageOptions = defaultItemsPerPageOptions,
  onChangeItemsPerPage = noop,
}) {
  return (
    <div
      className="flex justify-between p-2 bg-gray-50 width-full"
      data-testid="pagination"
    >
      <ItemsPerPageSelector
        itemsPerPageOptions={itemsPerPageOptions}
        currentItemsPerPage={currentItemsPerPage}
        onChange={onChangeItemsPerPage}
      />
      <ul className={containerClassNames}>
        <li>
          <button
            type="button"
            className={classNames(
              leftBoxClassNames,
              hasPrev || disabledLinkClassNames
            )}
            onClick={() => hasPrev && onSelect('prev')}
          >
            {PREV_LABEL}
          </button>
        </li>
        <li>
          <button
            type="button"
            className={classNames(
              rightBoxClassNames,
              hasNext || disabledLinkClassNames
            )}
            onClick={() => hasNext && onSelect('next')}
          >
            {NEXT_LABEL}
          </button>
        </li>
      </ul>
    </div>
  );
}

function Pagination({
  pages,
  currentPage,
  onSelect,
  currentItemsPerPage = defaultItemsPerPage,
  itemsPerPageOptions = defaultItemsPerPageOptions,
  itemsPresent,
  itemsTotal,
  onChangeItemsPerPage = noop,
}) {
  const selectedPage = Math.min(currentPage, pages);

  return (
    <div
      className="flex justify-between p-2 bg-gray-50 width-full"
      data-testid="pagination"
    >
      <ItemsPerPageSelector
        itemsPerPageOptions={itemsPerPageOptions}
        currentItemsPerPage={currentItemsPerPage}
        onChange={onChangeItemsPerPage}
      />

      <div className="flex flex-row items-center">
        <ItemsOnPageStats
          selectedPage={selectedPage}
          itemsTotal={itemsTotal}
          currentItemsPerPage={currentItemsPerPage}
          itemsPresent={itemsPresent}
        />

        {/* ReactPaginate paged are 0-based */}
        <ReactPaginate
          forcePage={selectedPage - 1}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
          pageCount={pages}
          breakLabel="..."
          renderOnZeroPageCount={null}
          onPageActive={({ selected }) => onSelect(selected + 1)}
          onPageChange={({ selected }) => onSelect(selected + 1)}
          previousLabel={PREV_LABEL}
          nextLabel={NEXT_LABEL}
          containerClassName={containerClassNames}
          pageLinkClassName={boxClassNames}
          activeLinkClassName={activeLinkClassNames}
          disabledLinkClassName={disabledLinkClassNames}
          previousLinkClassName={leftBoxClassNames}
          nextLinkClassName={rightBoxClassNames}
          breakLinkClassName={boxClassNames}
        />
      </div>
    </div>
  );
}

export default Pagination;

export { PaginationPrevNext, defaultItemsPerPageOptions, defaultItemsPerPage };
