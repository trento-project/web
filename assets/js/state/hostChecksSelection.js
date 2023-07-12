import { createAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
  saving: false,
};

export const checksSelectionSlice = createSlice({
  name: 'checksSelection',
  initialState,
  reducers: {
    startSavingChecksSelection: (state) => {
      state.saving = true;
    },
    stopSavingChecksSelection: (state) => {
      state.saving = false;
    },
  },
});

export const HOST_CHECKS_SELECTED = 'HOST_CHECKS_SELECTED';
export const checksSelected = createAction(HOST_CHECKS_SELECTED);

export const { startSavingChecksSelection, stopSavingChecksSelection } =
  checksSelectionSlice.actions;

export default checksSelectionSlice.reducer;
