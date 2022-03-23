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
} = databasesListSlice.actions;

export default databasesListSlice.reducer;
