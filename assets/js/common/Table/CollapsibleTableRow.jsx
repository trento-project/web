// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';
import { EOS_KEYBOARD_ARROW_DOWN } from 'eos-icons-react';

import { Checkbox } from '@common/Input';

function CollapsibleTableRow({
  columns,
  item,
  collapsibleDetailRenderer,
  wrapCollapsedRowInCell = true,
  renderCells = () => {},
  colSpan = 1,
  className,
  collapsedRowClassName,
  selectable = false,
  selected = false,
  onSelect = noop,
}) {
  const [rowExpanded, toggleRow] = useState(false);
  const collapsibleRowSpan = collapsibleDetailRenderer ? colSpan + 1 : colSpan;
  const collapsibleItem =
    collapsibleDetailRenderer &&
    collapsibleDetailRenderer(item, { columns, rowExpanded, renderCells });
  const isCollapsible = !!collapsibleItem;

  return (
    <>
      <tr
        className={classNames(className, { '!bg-jungle-green-100': selected })}
      >
        {selectable && (
          <td className="pl-5 border-b border-gray-200">
            <Checkbox
              aria-label="Select row"
              checked={selected}
              onChange={onSelect}
            />
          </td>
        )}
        {collapsibleDetailRenderer && (
          <td
            className={classNames(
              'border-b border-gray-200',
              { 'pl-2': !isCollapsible },
              { 'pl-4': isCollapsible }
            )}
            aria-label="collapsible-icon-cell"
            onClick={() => toggleRow(!rowExpanded)}
          >
            {isCollapsible && (
              <EOS_KEYBOARD_ARROW_DOWN
                className={classNames(
                  'cursor-pointer self-center fill-gray-500',
                  {
                    'transform rotate-180': rowExpanded,
                    closed: !rowExpanded,
                    open: rowExpanded,
                  }
                )}
              />
            )}
          </td>
        )}
        {renderCells(columns, item)}
      </tr>
      {isCollapsible && wrapCollapsedRowInCell ? (
        <tr
          className={classNames(
            collapsedRowClassName,
            'overflow-y-hidden transition-all ease-in-out duration-600'
          )}
          hidden={!rowExpanded}
        >
          <td colSpan={collapsibleRowSpan}>{collapsibleItem}</td>
        </tr>
      ) : (
        collapsibleItem
      )}
    </>
  );
}

export default CollapsibleTableRow;
