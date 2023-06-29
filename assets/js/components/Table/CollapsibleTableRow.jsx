import React, { Fragment, useState } from 'react';
import classNames from 'classnames';

function CollapsibleTableRow({
  columns,
  item,
  collapsibleDetailRenderer,
  renderCells = () => {},
  colSpan = 1,
  className,
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
          className={`overflow-y-hidden ${
            rowExpanded ? 'visible' : 'hidden'
          } transition-all ease-in-out duration-600`}
        >
          <td colSpan={colSpan}>{collapsibleDetailRenderer(item)}</td>
        </tr>
      )}
    </>
  );
}

export default CollapsibleTableRow;
