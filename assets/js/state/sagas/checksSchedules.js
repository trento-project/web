// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { get } from 'lodash';
import { all, call, put, select, takeEvery } from 'redux-saga/effects';

import {
  deleteSchedule,
  getSchedule,
  updateSchedule,
} from '@lib/api/checksSchedules';
import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';
import { defaultGlobalError } from '@lib/api/validationErrors';
import { checksFrequencySettingsUpdated } from '@state/checksFrequencySettings';

import {
  FETCH_CHECKS_SCHEDULE,
  UPDATE_CHECKS_SCHEDULE,
  REFRESH_CHECKS_SCHEDULES,
  startLoadingChecksSchedule,
  setChecksSchedule,
  checksScheduleRefreshed,
  setChecksScheduleErrors,
  setEditingChecksSchedule,
  setChecksScheduleNetworkError,
} from '@state/checksSchedules';

export function* fetchChecksSchedule({ payload: { targetType, targetID } }) {
  const target = { targetType, targetID };
  yield put(startLoadingChecksSchedule(target));

  try {
    const { data } = yield call(getSchedule, targetType, targetID);
    yield put(setChecksSchedule({ ...target, schedule: data }));
  } catch (error) {
    yield put(setChecksScheduleNetworkError({ ...target, networkError: true }));
  }
}

function* closeEditing(target) {
  yield put(setEditingChecksSchedule({ ...target, editing: false }));
  yield put(setChecksScheduleErrors({ ...target, errors: [] }));
}

function* storeOwnSchedule(target, schedule) {
  const { targetType, targetID } = target;
  const { data } = yield call(updateSchedule, targetType, targetID, schedule);

  yield put(setChecksSchedule({ ...target, schedule: data }));
  yield* closeEditing(target);
}

function* restoreSystemSetting(target) {
  const { targetType, targetID } = target;
  yield call(deleteSchedule, targetType, targetID);

  try {
    const { data } = yield call(getSchedule, targetType, targetID);
    yield put(setChecksSchedule({ ...target, schedule: data }));
    yield* closeEditing(target);
  } catch (error) {
    yield* closeEditing(target);
    yield put(setChecksScheduleNetworkError({ ...target, networkError: true }));
  }
}

export function* updateChecksSchedule({
  payload: { targetType, targetID, schedule },
}) {
  const target = { targetType, targetID };
  yield put(startLoadingChecksSchedule(target));

  try {
    if (schedule === null) {
      yield call(restoreSystemSetting, target);
    } else {
      yield call(storeOwnSchedule, target, schedule);
    }
  } catch (error) {
    const errors = get(
      error,
      ['response', 'data', 'errors'],
      [defaultGlobalError]
    );
    yield put(setChecksScheduleErrors({ ...target, errors }));
  }
}

const loadedTargets = (state) =>
  [TARGET_HOST, TARGET_CLUSTER].flatMap((targetType) =>
    Object.keys(get(state, ['checksSchedules', targetType], {})).map(
      (targetID) => ({ targetType, targetID })
    )
  );

function* refreshChecksSchedule({ targetType, targetID }) {
  try {
    const { data } = yield call(getSchedule, targetType, targetID);
    yield put(
      checksScheduleRefreshed({ targetType, targetID, schedule: data })
    );
  } catch (error) {
    // The schedule on display stays until the next refresh
  }
}

export function* refreshChecksSchedules({ payload: { targetType, targetID } }) {
  const loaded = yield select(loadedTargets);
  const targets = loaded.filter(
    (target) => target.targetType === targetType && target.targetID === targetID
  );

  yield all(targets.map((target) => call(refreshChecksSchedule, target)));
}

export function* refreshAllChecksSchedules() {
  const loaded = yield select(loadedTargets);

  yield all(loaded.map((target) => call(refreshChecksSchedule, target)));
}

export function* watchChecksSchedules() {
  yield takeEvery(FETCH_CHECKS_SCHEDULE, fetchChecksSchedule);
  yield takeEvery(UPDATE_CHECKS_SCHEDULE, updateChecksSchedule);
  yield takeEvery(REFRESH_CHECKS_SCHEDULES, refreshChecksSchedules);
  yield takeEvery(
    checksFrequencySettingsUpdated.type,
    refreshAllChecksSchedules
  );
}
