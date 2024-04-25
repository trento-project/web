import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isPremium: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setIsPremium: (state) => {
      state.isPremium = true;
    },
  },
});

export const { setIsPremium } = settingsSlice.actions;

export default settingsSlice.reducer;
