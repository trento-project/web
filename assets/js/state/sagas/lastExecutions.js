import { put, call, takeEvery, select } from 'redux-saga/effects';

import {
  UPDATE_LAST_EXECUTION,
  EXECUTION_REQUESTED,
  HOST_EXECUTION_REQUESTED,
} from '@state/actions/lastExecutions';
import { notify } from '@state/actions/notifications';
import {
  getLastExecutionByGroupID,
  triggerChecksExecution,
  triggerHostChecksExecution,
} from '@lib/api/checks';
import {
  setLastExecutionLoading,
  setLastExecution,
  setLastExecutionEmpty,
  setLastExecutionError,
  setExecutionRequested,
  setHostChecksExecutionRequested,
} from '@state/lastExecutions';

import { getClusterName } from '@state/selectors/cluster';
import { getHost } from '@state/selectors/host';

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
  const { clusterID, navigate } = payload;
  const clusterName = yield select(getClusterName(clusterID));

  try {
    yield call(triggerChecksExecution, clusterID);
    yield put(setExecutionRequested(payload));
    yield put(
      notify({
        text: `Checks execution requested, cluster: ${clusterName}`,
        icon: '🐰',
      })
    );
    navigate(`/clusters/${clusterID}/executions/last`);
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
  console.log('requestHostExecution started and payload:', payload);
  const { hostID, navigate } = payload;
  host = yield select(getHost(hostID));
  const { hostname: hostName } = host;
  try {
    console.log('here we fail');
    yield call(triggerHostChecksExecution, hostID);
    console.log('triggerHostChecksExecution was executed');
    yield put(setHostChecksExecutionRequested(payload));
    yield put(
      notify({
        text: `Checks execution requested, Host: ${hostName}`,
        icon: '🐰',
      })
    );
   // navigate(`/hosts/${hostID}/executions/last`);
  } catch (error) {
    yield put(
      notify({
        text: `Unable to start execution for host: ${hostName}`,
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

export function* watchHostRequestExecution() {
  console.log('watchHostRequestExecution');
  yield takeEvery(HOST_EXECUTION_REQUESTED, requestHostExecution);
}
