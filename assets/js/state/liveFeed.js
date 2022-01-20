import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  entries: [],
};

export const liveFeedSlice = createSlice({
  name: 'liveFeed',
  initialState,
  reducers: {
    appendEntryToLiveFeed: (state, { payload: { source, message } }) => {
      const time = Date.now();
      const newEntry = { time, source, message };
      const entries = [newEntry, ...state.entries];
      state.entries = entries;
    },
  },
});

export const { appendEntryToLiveFeed } = liveFeedSlice.actions;

export default liveFeedSlice.reducer;
