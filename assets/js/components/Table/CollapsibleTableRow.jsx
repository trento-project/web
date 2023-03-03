import React, { Fragment, useState } from 'react';

function CollapsibleTableRow({
  columns,
  item,
  collapsibleDetailRenderer,
  renderCells = () => {},
  colSpan = 1,
}) {
  const [rowExpanded, toggleRow] = useState(false);
  console.log('STAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAART');
  console.log('columns: ', columns);
  console.log('item: ', item);

  console.log('colla...', collapsibleDetailRenderer);
  console.log('renderCells' + renderCells);

  return (
    <>
      <tr
        className={collapsibleDetailRenderer ? 'cursor-pointer' : ''}
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
