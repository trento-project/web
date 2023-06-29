import databaseReducer, { removeDatabaseInstance } from '@state/databases';
import { databaseInstanceFactory } from '@lib/test-utils/factories/databases';

describe('Databases reducer', () => {
  it('should remove a datase instance from state', () => {
    const [instance1, instance2] = databaseInstanceFactory.buildList(2);
    const initialState = {
      databaseInstances: [instance1, instance2],
    };

    const action = removeDatabaseInstance(instance1);

    const expectedState = {
      databaseInstances: [instance2],
    };

    expect(databaseReducer(initialState, action)).toEqual(expectedState);
  });
});
