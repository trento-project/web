import { get } from 'lodash';
import { put, call, takeEvery, debounce } from 'redux-saga/effects';
import { notify } from '@state/notifications';
import {
  getSettings,
  saveSettings,
  updateSettings,
  clearSettings,
  testConnection,
} from '@lib/api/softwareUpdatesSettings';

import {
  FETCH_SOFTWARE_UPDATES_SETTINGS,
  SAVE_SOFTWARE_UPDATES_SETTINGS,
  UPDATE_SOFTWARE_UPDATES_SETTINGS,
  CLEAR_SOFTWARE_UPDATES_SETTINGS,
  TEST_SOFTWARE_UPDATES_CONNECTION,
  startLoadingSoftwareUpdatesSettings,
  setSoftwareUpdatesSettings,
  setEmptySoftwareUpdatesSettings,
  setSoftwareUpdatesSettingsErrors,
  setEditingSoftwareUpdatesSettings,
  setTestingSoftwareUpdatesConnection,
  setNetworkError,
} from '@state/softwareUpdatesSettings';

export function* fetchSoftwareUpdatesSettings() {
  yield put(startLoadingSoftwareUpdatesSettings());

  try {
    const response = yield call(getSettings);
    yield put(setSoftwareUpdatesSettings(response.data));
  } catch (error) {
    const errorCode = get(error, ['response', 'status']);
    yield put(setEmptySoftwareUpdatesSettings());
    if (errorCode !== 404) {
      yield put(setNetworkError(true));
    }
  }
}

export function* saveSoftwareUpdatesSettings({
  payload: { url, username, password, ca_cert },
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
    yield put(setEditingSoftwareUpdatesSettings(false));
    yield put(setSoftwareUpdatesSettingsErrors([]));
  } catch (error) {
    const errors = get(error, ['response', 'data', 'errors'], []);
    yield put(setSoftwareUpdatesSettingsErrors(errors));
  }
}

export function* updateSoftwareUpdatesSettings({ payload }) {
  yield put(startLoadingSoftwareUpdatesSettings());

  try {
    const response = yield call(updateSettings, payload);
    yield put(setSoftwareUpdatesSettings(response.data));
    yield put(setEditingSoftwareUpdatesSettings(false));
    yield put(setSoftwareUpdatesSettingsErrors([]));
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
    yield put(notify({ text: `Unable to clear settings`, icon: '❌' }));
  }
}

export function* testSoftwareUpdatesConnection() {
  yield put(setTestingSoftwareUpdatesConnection(true));
  try {
    yield call(testConnection);
    yield put(notify({ text: `Connection succeeded!`, icon: '✅' }));
  } catch (error) {
    yield put(notify({ text: `Connection failed!`, icon: '❌' }));
  }
  yield put(setTestingSoftwareUpdatesConnection(false));
}

export function* watchSoftwareUpdateSettings() {
  yield debounce(
    1000,
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
  yield takeEvery(
    TEST_SOFTWARE_UPDATES_CONNECTION,
    testSoftwareUpdatesConnection
  );
}
