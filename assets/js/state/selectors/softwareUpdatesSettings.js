import { createSelector } from '@reduxjs/toolkit';

export const getSoftwareUpdatesSettings = () =>
  createSelector(
    [({ softwareUpdatesSettings }) => softwareUpdatesSettings],
    ({ settings, error, loading, editing }) => ({
      settings,
      error,
      loading,
      editing,
    })
  );

export const getSoftwareUpdatesSettingsErrors = createSelector(
  [({ softwareUpdatesSettings }) => softwareUpdatesSettings],
  ({ errors }) => errors
);
