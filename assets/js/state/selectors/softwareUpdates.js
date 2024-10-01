import { get } from 'lodash';
import { createSelector } from '@reduxjs/toolkit';

export const getSoftwareUpdates = (state) => state?.softwareUpdates;

export const getSoftwareUpdatesForHost = (id) => (state) =>
  state?.softwareUpdates.softwareUpdates[id];

export const getSoftwareUpdatesStats = createSelector(
  [(state, id) => getSoftwareUpdatesForHost(id)(state)],
  (softwareUpdates) => ({
    numRelevantPatches: get(softwareUpdates, ['relevant_patches', 'length']),
    numUpgradablePackages: get(softwareUpdates, [
      'upgradable_packages',
      'length',
    ]),
  })
);

export const getSoftwareUpdatesSettingsConfigured = createSelector(
  [(state) => getSoftwareUpdates(state)],
  (softwareUpdates) => get(softwareUpdates, ['settingsConfigured'], false)
);

export const getSoftwareUpdatesPatches = createSelector(
  [(state, id) => getSoftwareUpdatesForHost(id)(state)],
  (softwareUpdates) => get(softwareUpdates, ['relevant_patches'], [])
);

export const getUpgradablePackages = createSelector(
  [(state, id) => getSoftwareUpdatesForHost(id)(state)],
  (softwareUpdates) => get(softwareUpdates, ['upgradable_packages'], [])
);

export const getSoftwareUpdatesLoading = createSelector(
  [(state, id) => getSoftwareUpdatesForHost(id)(state)],
  (softwareUpdates) => get(softwareUpdates, ['loading'], false)
);

export const getPatchesLoading = createSelector(
  [(state, id) => getSoftwareUpdatesForHost(id)(state)],
  (softwareUpdates) => get(softwareUpdates, ['loadingPatches'], false)
);

export const getSoftwareUpdatesErrors = createSelector(
  [(state, id) => getSoftwareUpdatesForHost(id)(state)],
  (softwareUpdates) => get(softwareUpdates, ['errors'], [])
);
