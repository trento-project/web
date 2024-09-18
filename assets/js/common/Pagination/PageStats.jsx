import React from 'react';

function PageStats({
  currentItemsPerPage,
  itemsPresent = 1,
  itemsTotal = 1,
  selectedPage,
}) {
  if (itemsTotal === 0) {
    return null;
  }
  const itemsBase = (selectedPage - 1) * currentItemsPerPage;
  const lowerBound = itemsBase + 1;
  const upperBound = itemsBase + itemsPresent;

  return (
    <span className="ml-4 text-sm text-gray-600">
      {`Showing ${lowerBound}–${upperBound} of ${itemsTotal}`}
    </span>
  );
}

export default PageStats;
