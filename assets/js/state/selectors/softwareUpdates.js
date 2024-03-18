import { createSelector } from '@reduxjs/toolkit';

export const getSoftwareUpdatesForHost = (id) => (state) =>
  state?.softwareUpdates.softwareUpdates[id];

export const getSoftwareUpdatesStats = createSelector(
  [(state, id) => getSoftwareUpdatesForHost(id)(state)],
  (softwareUpdates) => ({
    numRelevantPatches: softwareUpdates?.relevant_patches?.length,
    numUpgradablePackages: softwareUpdates?.upgradable_packages?.length,
  })
);
