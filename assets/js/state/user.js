import { createSlice } from '@reduxjs/toolkit';

// Fields set to undefined for the sake of documenting the state shape
export const initialState = {
  loggedIn: false,
  username: undefined,
  authError: null,
  authInProgress: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthInProgress(state, _payload) {
      state.authInProgress = true;
    },
    setAuthError(state, { payload: { error } }) {
      state.authInProgress = false;
      state.authError = error;
    },
    setUserAsLogged(state, _payload) {
      state.loggedIn = true;
      state.authInProgress = false;
      state.authError = null;
    },
    setUser(state, { payload: { username } }) {
      state.username = username;
    },
  },
});

export const { setUserAsLogged, setUser, setAuthError, setAuthInProgress } =
  userSlice.actions;

export default userSlice.reducer;
