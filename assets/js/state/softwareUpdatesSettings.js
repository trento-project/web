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
  networkError: null,
  editing: false,
  testingConnection: false,
  errors: [],
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
      state.networkError = null;
      state.settings = settings;
    },
    setEmptySoftwareUpdatesSettings: (state) => {
      state.loading = false;
      state.networkError = null;
      state.settings = emptySettings;
    },
    setSoftwareUpdatesSettingsErrors: (state, { payload: errors }) => {
      state.loading = false;
      state.networkError = null;
      state.errors = errors;
    },
    setEditingSoftwareUpdatesSettings: (state, { payload }) => {
      state.editing = payload;
    },
    setTestingSoftwareUpdatesConnection: (state, { payload }) => {
      state.testingConnection = payload;
    },
  },
});

export const FETCH_SOFTWARE_UPDATES_SETTINGS =
  'FETCH_SOFTWARE_UPDATES_SETTINGS';
export const SAVE_SOFTWARE_UPDATES_SETTINGS = 'SAVE_SOFTWARE_UPDATES_SETTINGS';
export const UPDATE_SOFTWARE_UPDATES_SETTINGS =
  'UPDATE_SOFTWARE_UPDATES_SETTINGS';
export const CLEAR_SOFTWARE_UPDATES_SETTINGS =
  'CLEAR_SOFTWARE_UPDATES_SETTINGS';

export const TEST_SOFTWARE_UPDATES_CONNECTION =
  'TEST_SOFTWARE_UPDATES_CONNECTION';

export const fetchSoftwareUpdatesSettings = createAction(
  FETCH_SOFTWARE_UPDATES_SETTINGS
);
export const saveSoftwareUpdatesSettings = createAction(
  SAVE_SOFTWARE_UPDATES_SETTINGS
);
export const updateSoftwareUpdatesSettings = createAction(
  UPDATE_SOFTWARE_UPDATES_SETTINGS
);
export const clearSoftwareUpdatesSettings = createAction(
  CLEAR_SOFTWARE_UPDATES_SETTINGS
);
export const testSoftwareUpdatesConnection = createAction(
  TEST_SOFTWARE_UPDATES_CONNECTION
);

export const {
  startLoadingSoftwareUpdatesSettings,
  setSoftwareUpdatesSettings,
  setEmptySoftwareUpdatesSettings,
  setSoftwareUpdatesSettingsErrors,
  setEditingSoftwareUpdatesSettings,
  setTestingSoftwareUpdatesConnection,
} = softwareUpdatesSettingsSlice.actions;

export default softwareUpdatesSettingsSlice.reducer;
