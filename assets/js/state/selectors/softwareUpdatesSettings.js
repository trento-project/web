import { createSelector } from '@reduxjs/toolkit';

export const getSoftwareUpdatesSettings = createSelector(
  [({ softwareUpdatesSettings }) => softwareUpdatesSettings],
  ({ settings, errors, loading, editing }) => ({
    settings,
    errors,
    loading,
    editing,
  })
);

export const getSoftwareUpdatesSettingsErrors = createSelector(
  [getSoftwareUpdatesSettings],
  ({ errors }) => errors
);
