import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: true,
  data: [],
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
      state.error = null;
      state.loading = false;
    },
    setCatalogError: (state, action) => {
      state.data = [];
      state.error = action.payload.error;
      state.loading = false;
    },
  },
});

export const UPDATE_CATALOG = 'UPDATE_CATALOG';

export const updateCatalog = (env = {}) => ({
  type: UPDATE_CATALOG,
  payload: env,
});

export const { setCatalogLoading, setCatalogData, setCatalogError } =
  catalogSlice.actions;

export default catalogSlice.reducer;
