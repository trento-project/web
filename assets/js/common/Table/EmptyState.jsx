import React from 'react';

function EmptyState({ colSpan = 1, emptyStateText }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-5 border-b border-gray-200 bg-white text-center text-sm"
      >
        {emptyStateText}
      </td>
    </tr>
  );
}

export default EmptyState;
