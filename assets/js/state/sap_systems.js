import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  sapSystems: [],
};

export const sapSystemsListSlice = createSlice({
  name: 'sapSystemsList',
  initialState,
  reducers: {
    setSapSystems: (state, action) => {
      state.sapSystems = action.payload;
    },
    startSapSystemsLoading: (state) => {
      state.loading = true;
    },
    stopSapSystemsLoading: (state) => {
      state.loading = false;
    },
  },
});

export const { startSapSystemsLoading, stopSapSystemsLoading, setSapSystems } =
  sapSystemsListSlice.actions;

export default sapSystemsListSlice.reducer;
