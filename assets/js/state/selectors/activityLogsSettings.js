import { createSelector } from '@reduxjs/toolkit';

export const getActivityLogsSettings = createSelector(
  [({ activityLogsSettings }) => activityLogsSettings],
  ({
    settings,
    errors,
    loading,
    editing,
    networkError,
    testingConnection,
  }) => ({
    settings,
    errors,
    loading,
    editing,
    networkError,
    testingConnection,
  })
);

export const getActivityLogsSettingsLoading = createSelector(
  [getActivityLogsSettings],
  ({ loading }) => loading
);

export const getActivityLogsSettingsSaved = createSelector(
  [getActivityLogsSettings],
  ({ settings: { retention_time } }) =>
    !!(retention_time && retention_time.value && retention_time.unit)
);

export const getActivityLogsSettingsErrors = createSelector(
  [getActivityLogsSettings],
  ({ errors }) => errors
);
