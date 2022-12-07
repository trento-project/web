import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  saving: false,
  savingError: null,
  savingSuccess: null,
};

export const clusterChecksSelectionSlice = createSlice({
  name: 'clusterChecksSelection',
  initialState,
  reducers: {
    startSavingClusterChecksSelection: (state) => {
      state.saving = true;
      state.savingError = null;
      state.savingSuccess = null;
    },
    stopSavingClusterChecksSelection: (state) => {
      state.saving = false;
    },
    setClusterChecksSelectionSavingError: (state) => {
      state.savingError =
        'An unexpected error happened while selecting your desired checks';
    },
    setClusterChecksSelectionSavingSuccess: (state) => {
      state.savingSuccess = true;
    },
  },
});

export const {
  startSavingClusterChecksSelection,
  stopSavingClusterChecksSelection,
  setClusterChecksSelectionSavingError,
  setClusterChecksSelectionSavingSuccess,
} = clusterChecksSelectionSlice.actions;

export default clusterChecksSelectionSlice.reducer;
