// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { get } from 'lodash';
import { put, call, takeEvery } from 'redux-saga/effects';
import { getSettings, updateSettings } from '@lib/api/checksFrequencySettings';

import {
  FETCH_CHECKS_FREQUENCY_SETTINGS,
  UPDATE_CHECKS_FREQUENCY_SETTINGS,
  startLoadingChecksFrequencySettings,
  setChecksFrequencySettings,
  setChecksFrequencySettingsErrors,
  setEditingChecksFrequencySettings,
  setChecksFrequencySettingsNetworkError,
} from '@state/checksFrequencySettings';
import { defaultGlobalError } from '@lib/api/validationErrors';

export function* fetchChecksFrequencySettings() {
  yield put(startLoadingChecksFrequencySettings());

  try {
    const response = yield call(getSettings);
    yield put(setChecksFrequencySettings(response.data));
  } catch (error) {
    yield put(setChecksFrequencySettingsNetworkError(true));
  }
}

export function* updateChecksFrequencySettings({ payload }) {
  yield put(startLoadingChecksFrequencySettings());
  try {
    const response = yield call(updateSettings, payload);
    yield put(setChecksFrequencySettings(response.data));
    yield put(setEditingChecksFrequencySettings(false));
    yield put(setChecksFrequencySettingsErrors([]));
  } catch (error) {
    const errors = get(
      error,
      ['response', 'data', 'errors'],
      [defaultGlobalError]
    );
    yield put(setChecksFrequencySettingsErrors(errors));
  }
}

export function* watchChecksFrequencySettings() {
  yield takeEvery(
    FETCH_CHECKS_FREQUENCY_SETTINGS,
    fetchChecksFrequencySettings
  );
  yield takeEvery(
    UPDATE_CHECKS_FREQUENCY_SETTINGS,
    updateChecksFrequencySettings
  );
}
