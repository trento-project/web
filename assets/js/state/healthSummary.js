import { createSlice } from '@reduxjs/toolkit';

// interface SapSystemHealthSummary {
//     id: string,
//     sid: string,
//     sapsystemHealth: string,
//     databaseHealth: string,
//     clustersHealth: string,
//     hostsHealth: string
// }

const initialState = {
  loading: false,
  sapSystemsHealth: [], // SapSystemHealthSummary[]
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
