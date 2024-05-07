import { createAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
  softwareUpdates: {},
};

const initialHostState = {
  loading: false,
  errors: [],
};

export const softwareUpdatesSlice = createSlice({
  name: 'softwareUpdates',
  initialState,
  reducers: {
    startLoadingSoftwareUpdates: (state, { payload: { hostID } }) => {
      state.softwareUpdates = {
        ...state.softwareUpdates,
        [hostID]: { ...initialHostState, loading: true },
      };
    },
    setSoftwareUpdates: (
      state,
      { payload: { hostID, relevant_patches, upgradable_packages } }
    ) => {
      state.softwareUpdates = {
        ...state.softwareUpdates,
        [hostID]: {
          ...initialHostState,
          relevant_patches,
          upgradable_packages,
        },
      };
    },
    setEmptySoftwareUpdates: (state, { payload: { hostID } }) => {
      state.softwareUpdates = {
        ...state.softwareUpdates,
        [hostID]: { ...initialHostState },
      };
    },
    setSoftwareUpdatesErrors: (state, { payload: { hostID, errors } }) => {
      state.softwareUpdates = {
        ...state.softwareUpdates,
        [hostID]: { ...initialHostState, errors },
      };
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
