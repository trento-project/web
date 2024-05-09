import { createAction, createSlice } from '@reduxjs/toolkit';

// Fields set to undefined for the sake of documenting the state shape
export const initialState = {
  loggedIn: false,
  username: undefined,
  fullname: undefined,
  email: undefined,
  id: undefined,
  abilities: undefined,
  created_at: undefined,
  updated_at: undefined,
  authError: null,
  authInProgress: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthInProgress(state, _payload) {
      state.authInProgress = true;
      state.authError = null;
    },
    setAuthError(state, { payload: { message, code } }) {
      state.authInProgress = false;
      state.authError = { message, code };
    },
    setUserAsLogged(state, _payload) {
      state.loggedIn = true;
      state.authInProgress = false;
      state.authError = null;
    },
    setUser(
      state,
      {
        payload: {
          username,
          id,
          email,
          created_at,
          fullname,
          updated_at,
          abilities,
        },
      }
    ) {
      state.username = username;
      state.email = email;
      state.id = id;
      state.created_at = created_at;
      state.fullname = fullname;
      state.updated_at = updated_at;
      state.abilities = abilities;
    },
  },
});

export const PERFORM_LOGIN = 'PERFORM_LOGIN';
export const USER_UPDATED = 'USER_UPDATED';
export const USER_LOCKED = 'USER_LOCKED';
export const USER_DELETED = 'USER_DELETED';

export const SET_USER_AS_LOGGED = 'user/setUserAsLogged';

export const initiateLogin = createAction(
  PERFORM_LOGIN,
  ({ username, password }) => ({ payload: { username, password } })
);

export const { setUserAsLogged, setUser, setAuthError, setAuthInProgress } =
  userSlice.actions;

export default userSlice.reducer;
