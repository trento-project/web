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
    updateDatabaseHealth: (state, action) => {
      state.databases = state.databases.map((database) => {
        if (database.id === action.payload.id) {
          database.health = action.payload.health;
        }
        return database;
      });
    },
    updateDatabaseInstanceHealth: (state, action) => {
      state.databaseInstances = state.databaseInstances.map((instance) => {
        return maybeUpdateInstanceHealth(action.payload, instance);
      });
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

export const {
  startDatabasesLoading,
  stopDatabasesLoading,
  setDatabases,
  appendDatabase,
  appendDatabaseInstance,
  updateDatabaseHealth,
  updateDatabaseInstanceHealth,
  updateDatabaseInstanceSystemReplication,
  addTagToDatabase,
  removeTagFromDatabase,
} = databasesListSlice.actions;

export default databasesListSlice.reducer;
