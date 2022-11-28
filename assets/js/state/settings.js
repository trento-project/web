import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  eulaVisible: false,
  isPremium: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setEulaVisible: (state) => {
      state.eulaVisible = true;
    },
    setIsPremium: (state) => {
      state.isPremium = true;
    },
    acceptEula: (state) => {
      state.eulaVisible = false;
    },
  },
});

export const { setEulaVisible, setIsPremium, acceptEula } = settingsSlice.actions;

export default settingsSlice.reducer;
