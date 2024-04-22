import { createSelector } from '@reduxjs/toolkit';

export const getSoftwareUpdatesSettings = createSelector(
  [({ softwareUpdatesSettings }) => softwareUpdatesSettings],
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

export const getSoftwareUpdatesSettingsSaved = createSelector(
  [getSoftwareUpdatesSettings],
  ({ settings: { url, username } }) => !!(url && username)
);

export const getSoftwareUpdatesSettingsErrors = createSelector(
  [getSoftwareUpdatesSettings],
  ({ errors }) => errors
);
