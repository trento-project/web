import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  catalog: [],
};

export const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setCatalog: (state, action) => {
      state.catalog = action.payload;
    },
  },
});

export const { setCatalog } = catalogSlice.actions;

export default catalogSlice.reducer;
