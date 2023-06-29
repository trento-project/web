import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

export const checksResultsFiltersSlice = createSlice({
  name: 'checksResultsFilters',
  initialState,
  reducers: {
    setSelectedFilters: (state, { payload: { resourceID, filters } }) => {
      state[resourceID] = filters;
    },
  },
});

export const { setSelectedFilters } = checksResultsFiltersSlice.actions;

export default checksResultsFiltersSlice.reducer;
