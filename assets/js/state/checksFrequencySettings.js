// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { createAction, createSlice } from '@reduxjs/toolkit';

const emptySettings = {
  enabled: undefined,
  frequency: undefined,
  enforced_from_env: false,
};

const initialState = {
  loading: true,
  settings: emptySettings,
  networkError: false,
  editing: false,
  errors: [],
};

export const checksFrequencySettingsSlice = createSlice({
  name: 'checksFrequencySettings',
  initialState,
  reducers: {
    startLoadingChecksFrequencySettings: (state) => {
      state.loading = true;
    },
    setChecksFrequencySettings: (state, { payload: settings }) => {
      state.loading = false;
      state.networkError = false;
      state.settings = settings;
    },
    setChecksFrequencySettingsErrors: (state, { payload: errors }) => {
      state.loading = false;
      state.networkError = false;
      state.errors = errors;
    },
    setEditingChecksFrequencySettings: (state, { payload }) => {
      state.editing = payload;
    },
    setChecksFrequencySettingsNetworkError: (state, { payload }) => {
      state.loading = false;
      state.networkError = payload;
    },
  },
});

export const FETCH_CHECKS_FREQUENCY_SETTINGS =
  'FETCH_CHECKS_FREQUENCY_SETTINGS';
export const UPDATE_CHECKS_FREQUENCY_SETTINGS =
  'UPDATE_CHECKS_FREQUENCY_SETTINGS';

export const fetchChecksFrequencySettings = createAction(
  FETCH_CHECKS_FREQUENCY_SETTINGS
);
export const updateChecksFrequencySettings = createAction(
  UPDATE_CHECKS_FREQUENCY_SETTINGS
);

export const {
  startLoadingChecksFrequencySettings,
  setChecksFrequencySettings,
  setChecksFrequencySettingsErrors,
  setEditingChecksFrequencySettings,
  setChecksFrequencySettingsNetworkError,
} = checksFrequencySettingsSlice.actions;

export default checksFrequencySettingsSlice.reducer;
