import { get } from 'lodash';

export const getSelectedFilters =
  (resourceID) =>
  ({ checksResultsFilters }) =>
    get(checksResultsFilters, resourceID, []);
