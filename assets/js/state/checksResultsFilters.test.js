import { faker } from '@faker-js/faker';
import checksResultsFiltersReducer, {
  setSelectedFilters,
} from './checksResultsFilters';

describe('Catalog reducer', () => {
  it('should set catalog on loading state', () => {
    const initialState = {};

    const resourceID = faker.datatype.uuid();

    const filters = ['warning'];

    const action = setSelectedFilters({ resourceID, filters });

    const expectedState = {
      [resourceID]: filters,
    };

    expect(checksResultsFiltersReducer(initialState, action)).toEqual(
      expectedState
    );
  });
});
