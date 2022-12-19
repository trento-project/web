import { put, call, takeEvery } from 'redux-saga/effects';

import {
  UPDATE_LAST_EXECUTION,
  EXECUTION_REQUESTED,
} from '@state/actions/lastExecutions';
import { getLastExecutionByGroupID } from '@lib/api/wanda';
import {
  setLastExecutionLoading,
  setLastExecution,
  setLastExecutionEmpty,
  setLastExecutionError,
  setExecutionRequested,
} from '@state/lastExecutions';

export function* updateLastExecution({ payload }) {
  const { groupID } = payload;

  yield put(setLastExecutionLoading(groupID));

  try {
    const { data } = yield call(getLastExecutionByGroupID, groupID);

    yield put(setLastExecution(data));
  } catch (error) {
    if (error.response && error.response.status === 404) {
      yield put(setLastExecutionEmpty(groupID));

      return;
    }

    yield put(setLastExecutionError({ groupID, error: error.message }));
  }
}

export function* requestExecution({ payload }) {
  yield put(setExecutionRequested(payload));
}

export function* watchUpdateLastExecution() {
  yield takeEvery(UPDATE_LAST_EXECUTION, updateLastExecution);
}

export function* watchRequestExecution() {
  yield takeEvery(EXECUTION_REQUESTED, requestExecution);
}
