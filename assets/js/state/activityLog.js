import { createAction, createSlice } from '@reduxjs/toolkit';

export const initialState = {
  users: [],
};

export const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    setUsers(state, { payload: { users } }) {
      state.users = users;
    },
  },
});

export const ACTIVITY_LOG_USERS_PUSHED = 'ACTIVITY_LOG_USERS_PUSHED';
export const activityLogUsersPushed = createAction(ACTIVITY_LOG_USERS_PUSHED);
export const { setUsers } = activityLogSlice.actions;

export default activityLogSlice.reducer;
