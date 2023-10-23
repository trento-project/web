import { createSlice } from '@reduxjs/toolkit';

// interface SapSystemHealthSummary {
//  application_cluster_health: string,
//  application_cluster_id:     string,
//  cluster_id:                 string,
//  clusters_health:            string,
//  database_cluster_health:    string,
//  database_cluster_id:        string,
//  database_health:            string,
//  database_id:                string,
//  hosts_health:               string,
//  id:                         string,
//  sapsystem_health:           string,
//  sid:                        string,
//  tenant:                     string,
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
