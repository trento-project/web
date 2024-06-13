import { createAction, createSlice } from '@reduxjs/toolkit';
import { instancesMatch, upsertInstances, updateInstance } from './instances';

const initialState = {
  loading: false,
  databases: [],
  databaseInstances: [],
};

export const databasesListSlice = createSlice({
  name: 'databasesList',
  initialState,
  reducers: {
    setDatabases: (state, { payload: databases }) => {
      state.databases = databases;

      state.databaseInstances = databases.flatMap(
        (database) => database.database_instances
      );
    },
    startDatabasesLoading: (state) => {
      state.loading = true;
    },
    stopDatabasesLoading: (state) => {
      state.loading = false;
    },
    appendDatabase: (state, { payload: newDatabase }) => {
      state.databases = [...state.databases, newDatabase];
    },
    removeDatabase: (state, { payload: { id } }) => {
      state.databases = state.databases.filter(
        (database) => database.id !== id
      );
      state.databaseInstances = state.databaseInstances.filter(
        (databaseInstance) => databaseInstance.database_id !== id
      );
    },
    updateDatabaseHealth: (state, { payload: { id, health } }) => {
      state.databases = state.databases.map((database) => {
        if (database.id === id) {
          database.health = health;
        }
        return database;
      });
    },
    addTagToDatabase: (state, { payload: { id, tags } }) => {
      state.databases = state.databases.map((database) => {
        if (database.id === id) {
          database.tags = [...database.tags, ...tags];
        }
        return database;
      });
    },
    removeTagFromDatabase: (state, { payload: { id, tags } }) => {
      state.databases = state.databases.map((database) => {
        if (database.id === id) {
          database.tags = database.tags.filter(
            (tag) => tag.value !== tags[0].value
          );
        }
        return database;
      });
    },
    upsertDatabaseInstances: (state, { payload: instances }) => {
      state.databaseInstances = upsertInstances(
        state.databaseInstances,
        instances
      );
    },
    removeDatabaseInstance: (state, { payload: instance }) => {
      state.databaseInstances = state.databaseInstances.filter(
        (databaseInstance) => !instancesMatch(databaseInstance, instance)
      );
    },
    updateDatabaseInstanceHealth: (state, { payload: instance }) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        instance,
        { health: instance.health }
      );
    },
    updateDatabaseInstanceSystemReplication: (state, { payload: instance }) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        instance,
        {
          system_replication: instance.system_replication,
          system_replication_status: instance.system_replication_status,
        }
      );
    },
    updateDatabaseInstanceAbsentAt: (state, { payload: instance }) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        instance,
        { absent_at: instance.absent_at }
      );
    },
    setDatabaseInstanceDeregistering: (state, { payload: instance }) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        instance,
        {
          deregistering: true,
        }
      );
    },
    unsetDatabaseInstanceDeregistering: (state, { payload: instance }) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        instance,
        {
          deregistering: false,
        }
      );
    },
  },
});

export const DATABASE_REGISTERED = 'DATABASE_REGISTERED';
export const DATABASE_DEREGISTERED = 'DATABASE_DEREGISTERED';
export const DATABASE_RESTORED = 'DATABASE_RESTORED';
export const DATABASE_HEALTH_CHANGED = 'DATABASE_HEALTH_CHANGED';
export const DATABASE_INSTANCE_REGISTERED = 'DATABASE_INSTANCE_REGISTERED';
export const DATABASE_INSTANCE_ABSENT_AT_CHANGED =
  'DATABASE_INSTANCE_ABSENT_AT_CHANGED';
export const DATABASE_INSTANCE_DEREGISTERED = 'DATABASE_INSTANCE_DEREGISTERED';
export const DATABASE_INSTANCE_HEALTH_CHANGED =
  'DATABASE_INSTANCE_HEALTH_CHANGED';
export const DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED =
  'DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED';
export const DEREGISTER_DATABASE_INSTANCE = 'DEREGISTER_DATABASE_INSTANCE';

export const databaseRegistered = createAction(DATABASE_REGISTERED);
export const databaseDeregistered = createAction(DATABASE_DEREGISTERED);
export const databaseRestored = createAction(DATABASE_RESTORED);
export const databaseHealthChanged = createAction(DATABASE_HEALTH_CHANGED);
export const databaseInstanceRegistered = createAction(
  DATABASE_INSTANCE_REGISTERED
);
export const databaseInstanceAbsentAtChanged = createAction(
  DATABASE_INSTANCE_ABSENT_AT_CHANGED
);
export const databaseInstanceDeregistered = createAction(
  DATABASE_INSTANCE_DEREGISTERED
);
export const databaseInstanceHealthChanged = createAction(
  DATABASE_INSTANCE_HEALTH_CHANGED
);
export const databaseInstanceSystemReplicationChanged = createAction(
  DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED
);
export const deregisterDatabaseInstance = createAction(
  DEREGISTER_DATABASE_INSTANCE
);

export const {
  startDatabasesLoading,
  stopDatabasesLoading,
  setDatabases,
  appendDatabase,
  removeDatabase,
  removeDatabaseInstance,
  upsertDatabaseInstances,
  updateDatabaseHealth,
  updateDatabaseInstanceHealth,
  updateDatabaseInstanceSystemReplication,
  updateDatabaseInstanceAbsentAt,
  addTagToDatabase,
  removeTagFromDatabase,
  setDatabaseInstanceDeregistering,
  unsetDatabaseInstanceDeregistering,
} = databasesListSlice.actions;

export default databasesListSlice.reducer;
