import { createAction, createSlice } from '@reduxjs/toolkit';

export const UPDATE_CATALOG = 'UPDATE_CATALOG';
export const updateCatalog = createAction(UPDATE_CATALOG);

const emptySettings = {
  url: undefined,
  username: undefined,
  ca_uploaded_at: undefined,
};

const initialState = {
  loading: false,
  settings: emptySettings,
  error: null,
};

export const softwareUpdatesSettingsSlice = createSlice({
  name: 'softwareUpdatesSettings',
  initialState,
  reducers: {
    startLoadingSoftwareUpdatesSettings: (state) => {
      state.loading = true;
    },
    setSoftwareUpdatesSettings: (state, { payload: settings }) => {
      state.loading = false;
      state.error = null;
      state.settings = settings;
    },
    setEmptySoftwareUpdatesSettings: (state) => {
      state.loading = false;
      state.error = null;
      state.settings = emptySettings;
    },
  },
});

export const FETCH_SOFTWARE_UPDATES_SETTINGS =
  'FETCH_SOFTWARE_UPDATES_SETTINGS';
export const fetchSoftwareUpdatesSettings = createAction(
  FETCH_SOFTWARE_UPDATES_SETTINGS
);

export const {
  startLoadingSoftwareUpdatesSettings,
  setSoftwareUpdatesSettings,
  setEmptySoftwareUpdatesSettings,
} = softwareUpdatesSettingsSlice.actions;

export default softwareUpdatesSettingsSlice.reducer;
