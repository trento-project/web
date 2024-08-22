import { createAction, createSlice } from '@reduxjs/toolkit';

export const initialState = {
  users: []
};

export const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    setUsers( state, { payload: { users }, }) {
      state.users = users;
    },
  },
});

export const AL_USERS_PUSHED = 'AL_USERS_PUSHED';
export const alUsersPushed = createAction(AL_USERS_PUSHED, ({users}) => ({payload: { users}}));
export const {  setUsers } =
  activityLogSlice.actions;

export default activityLogSlice.reducer;
