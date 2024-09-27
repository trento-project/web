import React from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';
import {
  EOS_KEYBOARD_ARROW_LEFT,
  EOS_KEYBOARD_ARROW_RIGHT,
  EOS_KEYBOARD_DOUBLE_ARROW_LEFT,
  EOS_KEYBOARD_DOUBLE_ARROW_RIGHT,
} from 'eos-icons-react';

import Select from '@common/Select';

const boxClassNames = classNames(
  'tn-page-item',
  'w-full',
  'px-3',
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
const disabledLinkClassNames = classNames(
  'text-zinc-400',
  'hover:bg-white',
  'cursor-default'
);
const containerClassNames = 'flex items-center';

const defaultItemsPerPageOptions = [10, 20, 50, 75, 100];
const defaultItemsPerPage = 10;

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
          className="w-20"
          optionsName=""
          options={itemsPerPageOptions}
          value={currentItemsPerPage}
          onChange={onChange}
        />
      </div>
    )
  );
}

function Pagination({
  hasPrev = true,
  hasNext = true,
  onSelect,
  currentItemsPerPage = defaultItemsPerPage,
  itemsPerPageOptions = defaultItemsPerPageOptions,
  pageStats = null,
  onChangeItemsPerPage = noop,
}) {
  return (
    <div
      className="flex justify-between p-2 bg-gray-50 width-full"
      data-testid="pagination"
    >
      <div className="flex flex-row items-center">
        <ItemsPerPageSelector
          itemsPerPageOptions={itemsPerPageOptions}
          currentItemsPerPage={currentItemsPerPage}
          onChange={onChangeItemsPerPage}
        />
        {pageStats}
      </div>
      <ul className={containerClassNames}>
        <li>
          <button
            type="button"
            disabled={!hasPrev}
            aria-label="first-page"
            className={classNames(
              leftBoxClassNames,
              hasPrev || disabledLinkClassNames
            )}
            onClick={() => hasPrev && onSelect('first')}
          >
            <EOS_KEYBOARD_DOUBLE_ARROW_LEFT
              className={classNames({
                'fill-gray-300': !hasPrev,
                'fill-gray-500': hasPrev,
              })}
            />
          </button>
        </li>
        <li>
          <button
            type="button"
            disabled={!hasPrev}
            aria-label="prev-page"
            className={classNames(
              boxClassNames,
              hasPrev || disabledLinkClassNames
            )}
            onClick={() => hasPrev && onSelect('prev')}
          >
            <EOS_KEYBOARD_ARROW_LEFT
              className={classNames({
                'fill-gray-300': !hasPrev,
                'fill-gray-500': hasPrev,
              })}
            />
          </button>
        </li>
        <li>
          <button
            type="button"
            disabled={!hasNext}
            aria-label="next-page"
            className={classNames(
              boxClassNames,
              hasNext || disabledLinkClassNames
            )}
            onClick={() => hasNext && onSelect('next')}
          >
            <EOS_KEYBOARD_ARROW_RIGHT
              className={classNames({
                'fill-gray-300': !hasNext,
                'fill-gray-500': hasNext,
              })}
            />
          </button>
        </li>
        <li>
          <button
            type="button"
            disabled={!hasNext}
            aria-label="last-page"
            className={classNames(
              rightBoxClassNames,
              hasNext || disabledLinkClassNames
            )}
            onClick={() => hasNext && onSelect('last')}
          >
            <EOS_KEYBOARD_DOUBLE_ARROW_RIGHT
              className={classNames({
                'fill-gray-300': !hasNext,
                'fill-gray-500': hasNext,
              })}
            />
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Pagination;

export { defaultItemsPerPageOptions, defaultItemsPerPage };
