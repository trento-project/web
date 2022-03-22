import { createSlice } from '@reduxjs/toolkit';

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
  },
});

export const { startDatabasesLoading, stopDatabasesLoading, setDatabases } =
  databasesListSlice.actions;

export default databasesListSlice.reducer;
