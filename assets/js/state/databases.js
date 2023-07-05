import { createSlice } from '@reduxjs/toolkit';
import { maybeUpdateInstanceHealth } from './instances';

const initialState = {
  loading: false,
  databases: [],
  databaseInstances: [],
};

export const databasesListSlice = createSlice({
  name: 'databasesList',
  initialState,
  reducers: {
    setDatabases: (state, { payload }) => {
      state.databases = payload;

      state.databaseInstances = payload.flatMap(
        (database) => database.database_instances
      );
    },
    startDatabasesLoading: (state) => {
      state.loading = true;
    },
    stopDatabasesLoading: (state) => {
      state.loading = false;
    },
    appendDatabase: (state, action) => {
      state.databases = [...state.databases, action.payload];
    },
    appendDatabaseInstance: (state, action) => {
      state.databaseInstances = [...state.databaseInstances, action.payload];
    },
    removeDatabase: (state, { payload: { id } }) => {
      state.databases = state.databases.filter(
        (database) => database.id !== id
      );
    },
    removeDatabaseInstance: (
      state,
      { payload: { sap_system_id, host_id, instance_number } }
    ) => {
      state.databaseInstances = state.databaseInstances.filter(
        (databaseInstance) =>
          !(
            databaseInstance.sap_system_id === sap_system_id &&
            databaseInstance.host_id === host_id &&
            databaseInstance.instance_number === instance_number
          )
      );
    },
    updateDatabaseHealth: (state, action) => {
      state.databases = state.databases.map((database) => {
        if (database.id === action.payload.id) {
          database.health = action.payload.health;
        }
        return database;
      });
    },
    updateDatabaseInstanceHealth: (state, action) => {
      state.databaseInstances = state.databaseInstances.map((instance) =>
        maybeUpdateInstanceHealth(action.payload, instance)
      );
    },
    updateDatabaseInstanceSystemReplication: (state, action) => {
      state.databaseInstances = state.databaseInstances.map((instance) => {
        if (
          action.payload.sap_system_id === instance.sap_system_id &&
          action.payload.host_id === instance.host_id &&
          action.payload.instance_number === instance.instance_number
        ) {
          instance.system_replication = action.payload.system_replication;
          instance.system_replication_status =
            action.payload.system_replication_status;
        }
        return instance;
      });
    },
    addTagToDatabase: (state, action) => {
      state.databases = state.databases.map((database) => {
        if (database.id === action.payload.id) {
          database.tags = [...database.tags, ...action.payload.tags];
        }
        return database;
      });
    },
    removeTagFromDatabase: (state, action) => {
      state.databases = state.databases.map((database) => {
        if (database.id === action.payload.id) {
          database.tags = database.tags.filter(
            (tag) => tag.value !== action.payload.tags[0].value
          );
        }
        return database;
      });
    },
  },
});

export const DATABASE_REGISTERED = 'DATABASE_REGISTERED';
export const DATABASE_DEREGISTERED = 'DATABASE_DEREGISTERED';
export const DATABASE_HEALTH_CHANGED = 'DATABASE_HEALTH_CHANGED';
export const DATABASE_INSTANCE_REGISTERED = 'DATABASE_INSTANCE_REGISTERED';
export const DATABASE_INSTANCE_DEREGISTERED = 'DATABASE_INSTANCE_DEREGISTERED';
export const DATABASE_INSTANCE_HEALTH_CHANGED =
  'DATABASE_INSTANCE_HEALTH_CHANGED';
export const DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED =
  'DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED';

export const {
  startDatabasesLoading,
  stopDatabasesLoading,
  setDatabases,
  appendDatabase,
  removeDatabase,
  removeDatabaseInstance,
  appendDatabaseInstance,
  updateDatabaseHealth,
  updateDatabaseInstanceHealth,
  updateDatabaseInstanceSystemReplication,
  addTagToDatabase,
  removeTagFromDatabase,
} = databasesListSlice.actions;

export default databasesListSlice.reducer;
