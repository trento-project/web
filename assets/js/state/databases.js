import { createSlice } from '@reduxjs/toolkit';
import {
  upsertInstances,
  payloadMatchesInstance,
  updateInstance,
} from './instances';

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
    removeDatabase: (state, { payload: { id } }) => {
      state.databases = state.databases.filter(
        (database) => database.id !== id
      );
      state.databaseInstances = state.databaseInstances.filter(
        (databaseInstance) => databaseInstance.sap_system_id !== id
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
    upsertDatabaseInstances: (state, action) => {
      state.databaseInstances = upsertInstances(
        state.databaseInstances,
        action.payload
      );
    },
    removeDatabaseInstance: (state, { payload }) => {
      state.databaseInstances = state.databaseInstances.filter(
        (databaseInstance) => !payloadMatchesInstance(databaseInstance, payload)
      );
    },
    updateDatabaseInstanceHealth: (state, { payload }) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        payload,
        { health: payload.health }
      );
    },
    updateDatabaseInstanceSystemReplication: (state, { payload }) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        payload,
        {
          system_replication: payload.system_replication,
          system_replication_status: payload.system_replication_status,
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
  upsertDatabaseInstances,
  updateDatabaseHealth,
  updateDatabaseInstanceHealth,
  updateDatabaseInstanceSystemReplication,
  addTagToDatabase,
  removeTagFromDatabase,
} = databasesListSlice.actions;

export default databasesListSlice.reducer;
