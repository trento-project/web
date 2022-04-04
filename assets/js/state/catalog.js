import { createSlice } from '@reduxjs/toolkit';

const errorMessages = {
  not_ready: 'The catalog is being built. Try again in some few moments',
  default: 'Unexpected error happened trying to get the checks catalog',
};

const initialState = {
  loading: false,
  data: [],
  error: '',
};

export const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setCatalog: (state, action) => {
      if (action.payload.loading) {
        state.loading = true;
        return;
      }

      state.loading = false;

      if (action.payload.error) {
        state.error =
          errorMessages[action.payload.error] || errorMessages['default'];
        state.data = [];
        return;
      }

      state.error = '';
      state.data = action.payload;
    },
  },
});

export const { setCatalog } = catalogSlice.actions;

export default catalogSlice.reducer;
