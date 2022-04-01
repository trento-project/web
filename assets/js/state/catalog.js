import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  data: [],
  error: "",
};

export const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setCatalog: (state, action) => {
      if (action.payload.error) {
        state.error = action.payload.error;
        state.data = [];
      } else {
        state.error = "";
        state.data = action.payload;
      }
    },
  },
});

export const { setCatalog } = catalogSlice.actions;

export default catalogSlice.reducer;
