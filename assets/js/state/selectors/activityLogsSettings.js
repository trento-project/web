import { createSelector } from '@reduxjs/toolkit';

export const getActivityLogsSettings = createSelector(
  [({ activityLogsSettings }) => activityLogsSettings],
  ({ settings, errors, loading, editing, networkError }) => ({
    settings,
    errors,
    loading,
    editing,
    networkError,
  })
);

export const getActivityLogsSettingsErrors = createSelector(
  [getActivityLogsSettings],
  ({ errors }) => errors
);
