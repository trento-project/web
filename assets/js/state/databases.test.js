import databaseReducer, {
  removeDatabase,
  removeDatabaseInstance,
  upsertDatabaseInstances,
  updateDatabaseInstanceHealth,
  updateDatabaseInstanceSystemReplication,
  updateDatabaseInstanceAbsentAt,
  setDatabaseInstanceDeregistering,
  unsetDatabaseInstanceDeregistering,
} from '@state/databases';
import {
  databaseFactory,
  databaseInstanceFactory,
} from '@lib/test-utils/factories/databases';

describe('Databases reducer', () => {
  it('should remove a database from state', () => {
    const [database1, database2] = databaseFactory.buildList(2);
    const database1DatabaseInstances = databaseInstanceFactory.buildList({
      database_id: database1.id,
    });
    const database2DatabaseInstances = databaseInstanceFactory.buildList({
      database_id: database2.id,
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

  it('should upsert database instances', () => {
    const initialInstances = databaseInstanceFactory.buildList(2);

    const initialState = {
      databaseInstances: initialInstances,
    };

    const updatedInstance = {
      ...initialState.databaseInstances[0],
      instance_hostname: 'my_name_has_changed',
    };
    const newInstance = databaseInstanceFactory.build();
    const newInstances = [updatedInstance, newInstance];

    const action = upsertDatabaseInstances(newInstances);

    const expectedState = {
      databaseInstances: [initialInstances[1], ...newInstances],
    };

    expect(databaseReducer(initialState, action)).toEqual(expectedState);
  });

  it('should update the health of a database instance', () => {
    const instance = databaseInstanceFactory.build();
    const newHealth = 'newHealth';

    const initialState = {
      databaseInstances: [instance],
    };

    const instanceToUpdate = {
      database_id: instance.database_id,
      instance_number: instance.instance_number,
      host_id: instance.host_id,
      health: newHealth,
    };
    const action = updateDatabaseInstanceHealth(instanceToUpdate);

    const expectedState = {
      databaseInstances: [{ ...instance, health: newHealth }],
    };

    expect(databaseReducer(initialState, action)).toEqual(expectedState);
  });

  it('should update the system replication data of a database instance', () => {
    const instance = databaseInstanceFactory.build();
    const newSystemReplication = 'newSR';
    const newStatus = 'newStatus';
    const newSite = 'newSite';
    const newMode = 'sync';
    const newOperationMode = 'logreplay';
    const newSourceSite = 'newSourceSite';
    const newTier = 1;

    const initialState = {
      databaseInstances: [instance],
    };

    const instanceToUpdate = {
      ...instance,
      system_replication: newSystemReplication,
      system_replication_status: newStatus,
      system_replication_site: newSite,
      system_replication_mode: newMode,
      system_replication_operation_mode: newOperationMode,
      system_replication_source_site: newSourceSite,
      system_replication_tier: newTier,
    };

    const action = updateDatabaseInstanceSystemReplication(instanceToUpdate);

    const expectedState = {
      databaseInstances: [
        {
          ...instance,
          system_replication: newSystemReplication,
          system_replication_status: newStatus,
          system_replication_site: newSite,
          system_replication_mode: newMode,
          system_replication_operation_mode: newOperationMode,
          system_replication_source_site: newSourceSite,
          system_replication_tier: newTier,
        },
      ],
    };

    expect(databaseReducer(initialState, action)).toEqual(expectedState);
  });

  it('should update the absent_at field of an database instance', () => {
    const instance = databaseInstanceFactory.build();
    const absentAt = Date.now();

    const initialState = {
      databaseInstances: [instance],
    };

    const instanceToUpdate = {
      ...instance,
      absent_at: absentAt,
    };

    const action = updateDatabaseInstanceAbsentAt(instanceToUpdate);

    const expectedState = {
      databaseInstances: [
        {
          ...instance,
          absent_at: absentAt,
        },
      ],
    };

    expect(databaseReducer(initialState, action)).toEqual(expectedState);
  });

  it('should set database instance in deregistering state', () => {
    const instance = databaseInstanceFactory.build();

    const initialState = {
      databaseInstances: [instance],
    };

    const action = setDatabaseInstanceDeregistering(instance);

    const expectedState = {
      databaseInstances: [
        {
          ...instance,
          deregistering: true,
        },
      ],
    };

    expect(databaseReducer(initialState, action)).toEqual(expectedState);
  });

  it('should remove deregistering state from database instance', () => {
    const instance = databaseInstanceFactory.build();

    const initialState = {
      databaseInstances: [instance],
    };

    const action = unsetDatabaseInstanceDeregistering(instance);

    const expectedState = {
      databaseInstances: [
        {
          ...instance,
          deregistering: false,
        },
      ],
    };

    expect(databaseReducer(initialState, action)).toEqual(expectedState);
  });
});
