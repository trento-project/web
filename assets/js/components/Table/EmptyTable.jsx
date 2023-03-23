import React from 'react';
import classNames from 'classnames';

function EmptyTable({ colSpan = 1, className = '', fontSize = 'text-sm' }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={classNames(
          'px-5 py-5 border-b border-gray-200 bg-white text-sm text-center',

          className,
          fontSize
        )}
      >
        No data available
      </td>
    </tr>
  );
}

export default EmptyTable;
