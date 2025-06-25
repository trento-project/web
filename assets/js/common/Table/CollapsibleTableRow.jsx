import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import { EOS_KEYBOARD_ARROW_DOWN } from 'eos-icons-react';

function CollapsibleTableRow({
  columns,
  item,
  collapsibleDetailRenderer,
  renderCells = () => {},
  colSpan = 1,
  className,
  collapsedRowClassName,
}) {
  const [rowExpanded, toggleRow] = useState(false);
  const collapsibleRowSpan = collapsibleDetailRenderer ? colSpan + 1 : colSpan;

  return (
    <>
      <tr className={className}>
        {collapsibleDetailRenderer && (
          <td
            className="pl-2 border-b border-gray-200 bg-white"
            onClick={() => toggleRow(!rowExpanded)}
          >
            <EOS_KEYBOARD_ARROW_DOWN
              className={classNames(
                'cursor-pointer self-center fill-gray-500',
                {
                  'transform rotate-180': rowExpanded,
                }
              )}
            />
          </td>
        )}
        {renderCells(columns, item)}
      </tr>
      {collapsibleDetailRenderer && (
        <tr
          className={classNames(
            collapsedRowClassName,
            'overflow-y-hidden transition-all ease-in-out duration-600',
          )}
          hidden={!rowExpanded}
        >
          <td colSpan={collapsibleRowSpan}>
            {collapsibleDetailRenderer(item)}
          </td>
        </tr>
      )}
    </>
  );
}

export default CollapsibleTableRow;
