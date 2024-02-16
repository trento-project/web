import { put, call, takeEvery } from 'redux-saga/effects';
import { getSettings } from '@lib/api/softwareUpdatesSettings';

import {
  FETCH_SOFTWARE_UPDATES_SETTINGS,
  startLoadingSoftwareUpdatesSettings,
  setSoftwareUpdatesSettings,
  setEmptySoftwareUpdatesSettings,
} from '@state/softwareUpdatesSettings';

export function* fetchSoftwareUpdatesSettings() {
  yield put(startLoadingSoftwareUpdatesSettings());

  try {
    const response = yield call(getSettings);
    yield put(setSoftwareUpdatesSettings(response.data));
  } catch (error) {
    yield put(setEmptySoftwareUpdatesSettings());
  }
}

export function* watchSoftwareUpdateSettings() {
  yield takeEvery(
    FETCH_SOFTWARE_UPDATES_SETTINGS,
    fetchSoftwareUpdatesSettings
  );
}
