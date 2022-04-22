import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  saving: false,
  settings: [],
  error: null,
  savingError: null,
};

export const clusterConnectionsSettingsSlice = createSlice({
  name: 'clusterConnectionSettings',
  initialState,
  reducers: {
    startLoadingClusterConnectionSettings: (state) => {
      state.loading = true;
      state.error = null;
      state.savingError = null;
    },
    stopLoadingClusterConnectionSettings: (state) => {
      state.loading = false;
    },
    setClusterConnectionSettings: (state, { payload }) => {
      state.settings = payload.settings;
    },
    setClusterConnectionSettingsLoadingError: (state) => {
      state.error =
        'An unexpected error happened loading the Connection Settings for the Cluster';
    },
    startSavingClusterConnectionSettings: (state) => {
      state.saving = true;
      state.savingError = null;
    },
    stopSavingClusterConnectionSettings: (state) => {
      state.saving = false;
    },
    setClusterConnectionSettingsSavingError: (state) => {
      state.savingError =
        'An unexpected error happened while saving your connection settings';
    },
  },
});

export const {
  startLoadingClusterConnectionSettings,
  stopLoadingClusterConnectionSettings,
  setClusterConnectionSettings,
  setClusterConnectionSettingsLoadingError,
  startSavingClusterConnectionSettings,
  stopSavingClusterConnectionSettings,
  setClusterConnectionSettingsSavingError,
} = clusterConnectionsSettingsSlice.actions;

export default clusterConnectionsSettingsSlice.reducer;
