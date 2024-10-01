import { get } from 'lodash';
import { put, call, takeEvery } from 'redux-saga/effects';
import {
  getSoftwareUpdates,
  getPatchesForPackages,
} from '@lib/api/softwareUpdates';

import {
  FETCH_UPGRADABLE_PACKAGES_PATCHES,
  FETCH_SOFTWARE_UPDATES,
  setSettingsConfigured,
  setSettingsNotConfigured,
  startLoadingSoftwareUpdates,
  setSoftwareUpdates,
  setEmptySoftwareUpdates,
  setSoftwareUpdatesErrors,
  setPatchesForPackages,
} from '@state/softwareUpdates';

export function* fetchSoftwareUpdates({ payload: hostID }) {
  yield put(startLoadingSoftwareUpdates({ hostID }));

  try {
    const response = yield call(getSoftwareUpdates, hostID);
    yield put(setSoftwareUpdates({ hostID, ...response.data }));
    yield put(setSettingsConfigured());
  } catch (error) {
    yield put(setEmptySoftwareUpdates({ hostID }));

    const errorCode = get(error, ['response', 'status']);
    const errors = get(error, ['response', 'data', 'errors'], []);
    const suma_unauthorized = errors.some(
      ({ detail }) => detail === 'SUSE Manager settings not configured.'
    );

    if (errorCode === 404 && suma_unauthorized) {
      yield put(setSettingsNotConfigured());
    } else {
      yield put(setSettingsConfigured());
    }

    yield put(setSoftwareUpdatesErrors({ hostID, errors }));
  }
}

export function* fetchUpgradablePackagesPatches({ payload: { hostID } }) {
  try {
    const {
      data: { patches },
    } = yield call(getPatchesForPackages, hostID);

    yield put(
      setPatchesForPackages({
        hostID,
        patches: patches.map((patch) => ({
          ...patch,
          package_id: Number(patch.package_id),
        })),
      })
    );
    yield put(setSettingsConfigured());
  } catch (error) {
    const errorCode = get(error, ['response', 'status']);
    const errors = get(error, ['response', 'data', 'errors'], []);

    const suma_unauthorized = errors.some(
      ({ detail }) => detail === 'SUSE Manager settings not configured.'
    );

    if (errorCode === 404 && suma_unauthorized) {
      yield put(setSettingsNotConfigured());
    } else {
      yield put(setSettingsConfigured());
    }

    yield put(setPatchesForPackages({ hostID, patches: [] }));
  }
}

export function* watchSoftwareUpdates() {
  yield takeEvery(FETCH_SOFTWARE_UPDATES, fetchSoftwareUpdates);
  yield takeEvery(
    FETCH_UPGRADABLE_PACKAGES_PATCHES,
    fetchUpgradablePackagesPatches
  );
}
