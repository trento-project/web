import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  sapSystemsHealth: [],
  error: '',
};

export const sapSystemsHealthSummarySlice = createSlice({
  name: 'sapSystemsHealthSummary',
  initialState,
  reducers: {
    setHealthSummary: (state, { payload }) => {
      state.sapSystemsHealth = payload;
    },
    startHealthSummaryLoading: (state) => {
      state.loading = true;
    },
    stopHealthSummaryLoading: (state) => {
      state.loading = false;
    },
  },
});

export const {
  startHealthSummaryLoading,
  stopHealthSummaryLoading,
  setHealthSummary,
} = sapSystemsHealthSummarySlice.actions;

export default sapSystemsHealthSummarySlice.reducer;
