import { get } from 'lodash';
import { put, call, takeEvery, debounce } from 'redux-saga/effects';
import { getSettings, updateSettings } from '@lib/api/activityLogsSettings';

import {
  FETCH_ACTIVITY_LOGS_SETTINGS,
  UPDATE_ACTIVITY_LOGS_SETTINGS,
  startLoadingActivityLogsSettings,
  setActivityLogsSettings,
  setActivityLogsSettingsErrors,
  setEditingActivityLogsSettings,
  setNetworkError,
} from '@state/activityLogsSettings';

export function* fetchActivityLogsSettings() {
  yield put(startLoadingActivityLogsSettings());

  try {
    const response = yield call(getSettings);
    yield put(setActivityLogsSettings(response.data));
  } catch (error) {
    yield put(setNetworkError(true));
  }
}

export function* updateActivityLogsSettings({ payload }) {
  yield put(startLoadingActivityLogsSettings());
  try {
    const response = yield call(updateSettings, payload);
    yield put(setActivityLogsSettings(response.data));
    yield put(setEditingActivityLogsSettings(false));
    yield put(setActivityLogsSettingsErrors([]));
  } catch (error) {
    const errors = get(error, ['response', 'data', 'errors'], []);
    yield put(setActivityLogsSettingsErrors(errors));
  }
}

export function* watchActivityLogsSettings() {
  yield debounce(1000, FETCH_ACTIVITY_LOGS_SETTINGS, fetchActivityLogsSettings);
  yield takeEvery(UPDATE_ACTIVITY_LOGS_SETTINGS, updateActivityLogsSettings);
}
