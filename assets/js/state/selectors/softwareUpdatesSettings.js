import { createSelector } from '@reduxjs/toolkit';

export const getSoftwareUpdatesSettings = createSelector(
  [({ softwareUpdatesSettings }) => softwareUpdatesSettings],
  ({ settings, errors, loading, editing, testingConnection }) => ({
    settings,
    errors,
    loading,
    editing,
    testingConnection,
  })
);

export const getSoftwareUpdatesSettingsErrors = createSelector(
  [getSoftwareUpdatesSettings],
  ({ errors }) => errors
);
