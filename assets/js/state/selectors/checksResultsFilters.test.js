import { faker } from '@faker-js/faker';

import { getSelectedFilters } from './checksResultsFilters';

describe('getSelectedFilters', () => {
  it('should return an empty array if the cluster ID is not found', () => {
    const resourceID = faker.datatype.uuid();

    expect(
      getSelectedFilters(resourceID)({ checksResultsFilters: {} })
    ).toEqual([]);
  });

  it('should return a list of selected filters when the cluster ID is found', () => {
    const resourceID = faker.datatype.uuid();
    const state = {
      checksResultsFilters: { [resourceID]: ['passing', 'critical'] },
    };

    expect(getSelectedFilters(resourceID)(state)).toEqual([
      'passing',
      'critical',
    ]);
  });
});
