import { createSelector } from '@reduxjs/toolkit';


export const getAlUsers = createSelector(
  [(state) => state.activityLog.users],
  (users) => users
);
