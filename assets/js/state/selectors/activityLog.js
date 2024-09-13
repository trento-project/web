import { createSelector } from '@reduxjs/toolkit';

export const getActivityLogUsers = createSelector(
  [(state) => state.activityLog],
  (activityLog) => activityLog.users
);
