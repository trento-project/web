import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  eulaVisible: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setEulaVisible: (state) => {
      state.eulaVisible = true;
    },
    acceptEula: (state) => {
      state.eulaVisible = false;
    },
  },
});

export const { setEulaVisible, acceptEula } = settingsSlice.actions;

export default settingsSlice.reducer;
