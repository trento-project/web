import { createSelector } from '@reduxjs/toolkit';

export const getSoftwareUpdatesSettings = () =>
  createSelector(
    [({ softwareUpdatesSettings }) => softwareUpdatesSettings],
    ({ settings, error, loading }) => ({
      settings,
      error,
      loading,
    })
  );
