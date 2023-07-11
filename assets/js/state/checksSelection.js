import { createAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
  saving: false,
  savingSuccess: false,
};

export const checksSelectionSlice = createSlice({
  name: 'checksSelection',
  initialState,
  reducers: {
    startSavingChecksSelection: (state) => {
      state.saving = true;
      state.savingSuccess = false;
    },
    stopSavingChecksSelection: (state) => {
      state.saving = false;
    },
    setChecksSelectionSavingSuccess: (state) => {
      state.savingSuccess = true;
    },
  },
});

export const CHECKS_SELECTED = 'CHECKS_SELECTED';
export const checksSelected = createAction(CHECKS_SELECTED);

export const {
  startSavingChecksSelection,
  stopSavingChecksSelection,
  setChecksSelectionSavingSuccess,
} = checksSelectionSlice.actions;

export default checksSelectionSlice.reducer;
