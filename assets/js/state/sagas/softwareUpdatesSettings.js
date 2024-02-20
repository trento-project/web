import { get } from 'lodash';
import { put, call, takeEvery } from 'redux-saga/effects';
import {
  getSettings,
  saveSettings,
  updateSettings,
  clearSettings,
} from '@lib/api/softwareUpdatesSettings';

import {
  FETCH_SOFTWARE_UPDATES_SETTINGS,
  SAVE_SOFTWARE_UPDATES_SETTINGS,
  UPDATE_SOFTWARE_UPDATES_SETTINGS,
  CLEAR_SOFTWARE_UPDATES_SETTINGS,
  startLoadingSoftwareUpdatesSettings,
  setSoftwareUpdatesSettings,
  setEmptySoftwareUpdatesSettings,
  setSoftwareUpdatesSettingsErrors,
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

export function* saveSoftwareUpdatesSettings({
  url,
  username,
  password,
  ca_cert,
}) {
  yield put(startLoadingSoftwareUpdatesSettings());

  try {
    const response = yield call(saveSettings, {
      url,
      username,
      password,
      ca_cert,
    });
    yield put(setSoftwareUpdatesSettings(response.data));
  } catch (error) {
    const errors = get(error, ['response', 'data', 'errors'], []);
    yield put(setSoftwareUpdatesSettingsErrors(errors));
  }
}

export function* updateSoftwareUpdatesSettings(payload) {
  yield put(startLoadingSoftwareUpdatesSettings());

  try {
    const response = yield call(updateSettings, payload);
    yield put(setSoftwareUpdatesSettings(response.data));
  } catch (error) {
    const errors = get(error, ['response', 'data', 'errors'], []);
    yield put(setSoftwareUpdatesSettingsErrors(errors));
  }
}

export function* clearSoftwareUpdatesSettings() {
  yield put(startLoadingSoftwareUpdatesSettings());

  try {
    yield call(clearSettings);

    yield put(setEmptySoftwareUpdatesSettings());
  } catch (error) {
    const errors = get(error, ['response', 'data', 'errors'], []);
    yield put(setSoftwareUpdatesSettingsErrors(errors));
  }
}

export function* watchSoftwareUpdateSettings() {
  yield takeEvery(
    FETCH_SOFTWARE_UPDATES_SETTINGS,
    fetchSoftwareUpdatesSettings
  );
  yield takeEvery(SAVE_SOFTWARE_UPDATES_SETTINGS, saveSoftwareUpdatesSettings);
  yield takeEvery(
    UPDATE_SOFTWARE_UPDATES_SETTINGS,
    updateSoftwareUpdatesSettings
  );
  yield takeEvery(
    CLEAR_SOFTWARE_UPDATES_SETTINGS,
    clearSoftwareUpdatesSettings
  );
}
