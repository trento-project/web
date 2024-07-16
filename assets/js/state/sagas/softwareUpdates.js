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

    if (errorCode === 403) {
      yield put(setSettingsNotConfigured());
    }

    const errors = get(error, ['response', 'data'], []);
    yield put(setSoftwareUpdatesErrors({ hostID, errors }));
  }
}

export function* fetchUpgradablePackagesPatches({
  payload: { hostID, packageIDs },
}) {
  try {
    const {
      data: { patches },
    } = yield call(getPatchesForPackages, packageIDs);
    yield put(setPatchesForPackages({ hostID, patches }));
    yield put(setSettingsConfigured());
  } catch (error) {
    const errorCode = get(error, ['response', 'status']);

    if (errorCode === 403) {
      yield put(setSettingsNotConfigured());
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
