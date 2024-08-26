import { createSelector } from '@reduxjs/toolkit';

export const getAlUsers = createSelector(
  [(state) => state.activityLog],
  (activityLog) => activityLog.users
);
