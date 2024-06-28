import { createAction, createSlice } from '@reduxjs/toolkit';

const emptySettings = {
  retention_time: undefined,
};

const initialState = {
  loading: true,
  settings: emptySettings,
  networkError: false,
  editing: false,
  errors: [],
};
export const activityLogsSettingsSlice = createSlice({
  name: 'activityLogsSettings',
  initialState,
  reducers: {
    startLoadingActivityLogsSettings: (state) => {
      state.loading = true;
    },
    setActivityLogsSettings: (state, { payload: settings }) => {
      state.loading = false;
      state.networkError = false;
      state.settings = settings;
    },
    setActivityLogsSettingsErrors: (state, { payload: errors }) => {
      state.loading = false;
      state.networkError = false;
      state.errors = errors;
    },
    setEditingActivityLogsSettings: (state, { payload }) => {
      state.editing = payload;
    },

    setNetworkError: (state, { payload }) => {
      state.loading = false;
      state.networkError = payload;
    },
  },
});

export const FETCH_ACTIVITY_LOGS_SETTINGS = 'FETCH_ACTIVITY_LOGS_SETTINGS';
export const UPDATE_ACTIVITY_LOGS_SETTINGS = 'UPDATE_ACTIVITY_LOGS_SETTINGS';

export const fetchActivityLogsSettings = createAction(
  FETCH_ACTIVITY_LOGS_SETTINGS
);
export const updateActivityLogsSettings = createAction(
  UPDATE_ACTIVITY_LOGS_SETTINGS
);
export const {
  startLoadingActivityLogsSettings,
  setActivityLogsSettings,
  setActivityLogsSettingsErrors,
  setEditingActivityLogsSettings,
  setNetworkError,
} = activityLogsSettingsSlice.actions;

export default activityLogsSettingsSlice.reducer;
