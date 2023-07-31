import databaseReducer, {
  removeDatabase,
  removeDatabaseInstance,
  upsertDatabaseInstances,
} from '@state/databases';
import {
  databaseFactory,
  databaseInstanceFactory,
} from '@lib/test-utils/factories/databases';

describe('Databases reducer', () => {
  it('should remove a database instance from state', () => {
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

  it('should remove a database from state', () => {
    const [database1, database2] = databaseFactory.buildList(2);
    const database1DatabaseInstances = databaseInstanceFactory.buildList({
      sap_system_id: database1.id,
    });
    const database2DatabaseInstances = databaseInstanceFactory.buildList({
      sap_system_id: database2.id,
    });
    const initialState = {
      databases: [database1, database2],
      databaseInstances: database1DatabaseInstances.concat(
        database2DatabaseInstances
      ),
    };

    const action = removeDatabase(database1);

    const expectedState = {
      databases: [database2],
      databaseInstances: database2DatabaseInstances,
    };

    expect(databaseReducer(initialState, action)).toEqual(expectedState);
  });

  it('should upsert database instances', () => {
    const changedIndex = 0;

    const initialState = {
      databaseInstances: databaseInstanceFactory.buildList(2),
    };

    const updatedInstance = {
      ...initialState.databaseInstances[changedIndex],
      instance_hostname: 'my_name_has_changed',
    };
    const newInstance = databaseInstanceFactory.build();
    const newInstances = [updatedInstance, newInstance];

    const action = upsertDatabaseInstances(newInstances);

    const expectedState = {
      databaseInstances: initialState.databaseInstances
        .filter((_instance, index) => index !== changedIndex)
        .concat(newInstances),
    };

    expect(databaseReducer(initialState, action)).toEqual(expectedState);
  });
});
