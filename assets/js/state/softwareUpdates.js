import { createAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
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
      { payload: { hostId, relevant_patches, upgradable_packages } }
    ) => {
      state.loading = false;

      state.softwareUpdates = {
        ...state.softwareUpdates,
        [hostId]: {
          relevant_patches,
          upgradable_packages,
        },
      };
    },
    setEmptySoftwareUpdates: (state, { payload: { hostId } }) => {
      state.loading = false;
      state.softwareUpdates = { ...state.softwareUpdates, [hostId]: {} };
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
  setEmptySoftwareUpdates,
  setSoftwareUpdatesErrors,
} = softwareUpdatesSlice.actions;

export default softwareUpdatesSlice.reducer;
