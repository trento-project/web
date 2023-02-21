import { put, call, takeEvery, select } from 'redux-saga/effects';

import {
  UPDATE_LAST_EXECUTION,
  EXECUTION_REQUESTED,
} from '@state/actions/lastExecutions';
import { notify } from '@state/actions/notifications';
import {
  getLastExecutionByGroupID,
  triggerChecksExecution,
} from '@lib/api/checks';
import {
  setLastExecutionLoading,
  setLastExecution,
  setLastExecutionEmpty,
  setLastExecutionError,
  setExecutionRequested,
} from '@state/lastExecutions';

import { getClusterName } from '@state/selectors/cluster';

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
  const clusterName = yield select(getClusterName(payload.clusterID));

  try {
    yield call(triggerChecksExecution, payload.clusterID);
    yield put(setExecutionRequested(payload));
    yield put(
      notify({
        text: `Checks execution requested, cluster: ${clusterName}`,
        icon: '🐰',
      })
    );
  } catch (error) {
    yield put(
      notify({
        text: `Unable to start execution for cluster: ${clusterName}`,
        icon: '❌',
      })
    );
  }
}

export function* watchUpdateLastExecution() {
  yield takeEvery(UPDATE_LAST_EXECUTION, updateLastExecution);
}

export function* watchRequestExecution() {
  yield takeEvery(EXECUTION_REQUESTED, requestExecution);
}
