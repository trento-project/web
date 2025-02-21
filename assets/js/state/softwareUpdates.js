import { createAction, createSlice } from '@reduxjs/toolkit';
import { find, get, isEmpty } from 'lodash';

const initialState = {
  settingsConfigured: true,
  softwareUpdates: {},
};

const initialHostState = {
  loading: false,
  loadingPatches: false,
  errors: [],
};

export const softwareUpdatesSlice = createSlice({
  name: 'softwareUpdates',
  initialState,
  reducers: {
    setSettingsConfigured: (state) => {
      state.settingsConfigured = true;
    },
    setSettingsNotConfigured: (state) => {
      state.settingsConfigured = false;
    },
    startLoadingSoftwareUpdates: (state, { payload: { hostID } }) => {
      state.softwareUpdates = {
        ...state.softwareUpdates,
        [hostID]: { ...initialHostState, loading: true, loadingPatches: true },
      };
    },
    setSoftwareUpdates: (
      state,
      { payload: { hostID, relevant_patches, upgradable_packages } }
    ) => {
      state.softwareUpdates = {
        ...state.softwareUpdates,
        [hostID]: {
          ...state.softwareUpdates[hostID],
          loading: false,
          relevant_patches,
          upgradable_packages,
        },
      };
    },
    setEmptySoftwareUpdates: (state, { payload: { hostID } }) => {
      state.softwareUpdates = {
        ...state.softwareUpdates,
        [hostID]: { ...initialHostState },
      };
    },
    setSoftwareUpdatesErrors: (state, { payload: { hostID, errors } }) => {
      state.softwareUpdates = {
        ...state.softwareUpdates,
        [hostID]: { ...initialHostState, errors },
      };
    },
    setPatchesForPackages: (state, { payload: { hostID, patches } }) => {
      const packages = get(
        state,
        ['softwareUpdates', hostID, 'upgradable_packages'],
        []
      );

      const newPackages = packages.map((currentPackage) => {
        const { to_package_id: packageID } = currentPackage;

        const packageInfo = find(patches, { package_id: packageID });
        const packagePatches = get(packageInfo, 'patches', []);

        return {
          ...currentPackage,
          patches: packagePatches,
        };
      });

      if (state.softwareUpdates[hostID]) {
        state.softwareUpdates[hostID].loadingPatches = false;
      }

      if (!isEmpty(packages)) {
        state.softwareUpdates[hostID].upgradable_packages = newPackages;
      }
    },
  },
});

export const FETCH_SOFTWARE_UPDATES = 'FETCH_SOFTWARE_UPDATES';
export const FETCH_UPGRADABLE_PACKAGES_PATCHES =
  'FETCH_UPGRADABLE_PACKAGES_PATCHES';

export const fetchSoftwareUpdates = createAction(FETCH_SOFTWARE_UPDATES);
export const fetchUpgradablePackagesPatches = createAction(
  FETCH_UPGRADABLE_PACKAGES_PATCHES
);

export const {
  setSettingsConfigured,
  setSettingsNotConfigured,
  startLoadingSoftwareUpdates,
  setSoftwareUpdates,
  setEmptySoftwareUpdates,
  setSoftwareUpdatesErrors,
  setPatchesForPackages,
} = softwareUpdatesSlice.actions;

export default softwareUpdatesSlice.reducer;
