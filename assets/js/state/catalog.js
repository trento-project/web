import { createAction, createSlice } from '@reduxjs/toolkit';

export const UPDATE_CATALOG = 'UPDATE_CATALOG';
export const updateCatalog = createAction(UPDATE_CATALOG);

const initialState = {
  loading: true,
  data: [],
  filteredCatalog: [],
  error: null,
};

export const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setCatalogLoading: (state) => {
      state.loading = true;
    },
    setCatalogData: (state, action) => {
      state.data = action.payload.data;
      state.filteredCatalog = action.payload.data;
      state.error = null;
      state.loading = false;
    },
    setFilteredCatalog: (state, action) => {
      state.filteredCatalog = action.payload.data;
      state.error = null;
      state.loading = false;
    },
    setCatalogError: (state, action) => {
      state.data = [];
      state.filteredCatalog = [];
      state.error = action.payload.error;
      state.loading = false;
    },
  },
});

export const {
  setCatalogLoading,
  setFilteredCatalog,
  setCatalogData,
  setCatalogError,
} = catalogSlice.actions;

export default catalogSlice.reducer;
