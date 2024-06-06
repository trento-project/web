import { get } from 'lodash';
import { put, call, takeEvery } from 'redux-saga/effects';
import {
  getSoftwareUpdates,
  getPatchesForPackages,
} from '@lib/api/softwareUpdates';

import {
  FETCH_UPGRADABLE_PACKAGES_PATCHES,
  FETCH_SOFTWARE_UPDATES,
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
  } catch (error) {
    yield put(setEmptySoftwareUpdates({ hostID }));

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
  } catch (error) {
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
