import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  saving: false,
  settings: [],
  error: null,
  savingError: null,
  savingSuccess: null,
};

export const clusterConnectionsSettingsSlice = createSlice({
  name: 'clusterConnectionSettings',
  initialState,
  reducers: {
    startLoadingClusterConnectionSettings: (state) => {
      state.loading = true;
      state.error = null;
      state.savingError = null;
      state.savingSuccess = null;
    },
    stopLoadingClusterConnectionSettings: (state) => {
      state.loading = false;
    },
    setClusterConnectionSettings: (state, { payload }) => {
      state.settings = payload.settings;
    },
    setClusterConnectionSettingsLoadingError: (state) => {
      state.error = 'An unexpected error happened loading the Connection Settings for the Cluster';
    },
    startSavingClusterConnectionSettings: (state) => {
      state.saving = true;
      state.savingError = null;
      state.savingSuccess = null;
    },
    stopSavingClusterConnectionSettings: (state) => {
      state.saving = false;
    },
    setClusterConnectionSettingsSavingError: (state) => {
      state.savingError = 'An unexpected error happened while saving your connection settings';
    },
    setClusterConnectionSettingsSavingSuccess: (state) => {
      state.savingSuccess = true;
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
  setClusterConnectionSettingsSavingSuccess,
} = clusterConnectionsSettingsSlice.actions;

export default clusterConnectionsSettingsSlice.reducer;
