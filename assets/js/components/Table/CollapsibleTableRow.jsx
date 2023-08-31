import React, { Fragment, useState } from 'react';
import classNames from 'classnames';

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

  return (
    <>
      <tr
        className={classNames(className, {
          'cursor-pointer': !!collapsibleDetailRenderer,
        })}
        onClick={() => {
          if (collapsibleDetailRenderer) {
            toggleRow(!rowExpanded);
          }
        }}
      >
        {renderCells(columns, item)}
      </tr>
      {collapsibleDetailRenderer && (
        <tr
          className={classNames(
            collapsedRowClassName,
            'overflow-y-hidden transition-all ease-in-out duration-600',
            { visible: rowExpanded, hidden: !rowExpanded }
          )}
        >
          <td colSpan={colSpan}>{collapsibleDetailRenderer(item)}</td>
        </tr>
      )}
    </>
  );
}

export default CollapsibleTableRow;
