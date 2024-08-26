import { createSelector } from '@reduxjs/toolkit';

export const getALUsers = createSelector(
  [(state) => state.activityLog],
  (activityLog) => activityLog.users
);
