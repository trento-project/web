import { createAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  connectionError: false,
  softwareUpdates: {},
  errors: [],
};

export const softwareUpdatesSlice = createSlice({
  name: 'softwareUpdates',
  initialState,
  reducers: {
    startLoadingSoftwareUpdates: (state) => {
      state.loading = true;
    },
    setSoftwareUpdates: (
      state,
      { payload: { hostID, relevant_patches, upgradable_packages } }
    ) => {
      state.loading = false;
      state.connectionError = false;

      state.softwareUpdates = {
        ...state.softwareUpdates,
        [hostID]: {
          relevant_patches,
          upgradable_packages,
        },
      };
    },
    setSoftwareUpdatesConnectionError: (state) => {
      state.connectionError = true;
    },
    setEmptySoftwareUpdates: (state, { payload: { hostID } }) => {
      state.loading = false;
      state.softwareUpdates = { ...state.softwareUpdates, [hostID]: {} };
    },
    setSoftwareUpdatesErrors: (state, { payload: errors }) => {
      state.loading = false;
      state.errors = errors;
    },
  },
});

export const FETCH_SOFTWARE_UPDATES = 'FETCH_SOFTWARE_UPDATES';

export const fetchSoftwareUpdates = createAction(FETCH_SOFTWARE_UPDATES);

export const {
  startLoadingSoftwareUpdates,
  setSoftwareUpdates,
  setSoftwareUpdatesConnectionError,
  setEmptySoftwareUpdates,
  setSoftwareUpdatesErrors,
} = softwareUpdatesSlice.actions;

export default softwareUpdatesSlice.reducer;
