import { put, call, takeEvery, select, getContext } from 'redux-saga/effects';

import { notify } from '@state/notifications';
import {
  getLastExecutionByGroupID,
  triggerClusterChecksExecution,
  triggerHostChecksExecution,
} from '@lib/api/checks';
import {
  CLUSTER_EXECUTION_REQUESTED,
  HOST_EXECUTION_REQUESTED,
  UPDATE_LAST_EXECUTION,
  setLastExecutionLoading,
  setLastExecution,
  setLastExecutionEmpty,
  setLastExecutionError,
  setExecutionRequested,
  setHostChecksExecutionRequested,
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
  const { clusterID } = payload;
  const clusterName = yield select(getClusterName(clusterID));
  const router = yield getContext('router');

  try {
    yield call(triggerClusterChecksExecution, clusterID);
    yield put(setExecutionRequested(payload));
    yield put(
      notify({
        text: `Checks execution requested, cluster: ${clusterName}`,
        icon: '🐰',
      })
    );
    yield call(router.navigate, `/clusters/${clusterID}/executions/last`);
  } catch (error) {
    yield put(
      notify({
        text: `Unable to start execution for cluster: ${clusterName}`,
        icon: '❌',
      })
    );
  }
}

export function* requestHostExecution({ payload }) {
  const { host } = payload;
  const { id: hostID, hostname: hostName } = host;
  const router = yield getContext('router');

  try {
    yield call(triggerHostChecksExecution, hostID);
    yield put(setHostChecksExecutionRequested(payload));
    yield put(
      notify({
        text: `Checks execution requested, host: ${hostName}`,
        icon: '🐰',
      })
    );
    yield call(router.navigate, `/hosts/${hostID}/executions/last`);
  } catch (error) {
    yield put(
      notify({
        text: `Unable to start execution for host: ${hostName}`,
        icon: '❌',
      })
    );
  }
}

export function* watchLastExecutionEvents() {
  yield takeEvery(UPDATE_LAST_EXECUTION, updateLastExecution);
  yield takeEvery(CLUSTER_EXECUTION_REQUESTED, requestExecution);
  yield takeEvery(HOST_EXECUTION_REQUESTED, requestHostExecution);
}
