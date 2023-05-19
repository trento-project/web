export const getSelectedFilters =
  (resourceID) =>
  ({ checksResultsFilters }) =>
    checksResultsFilters[resourceID] || [];
