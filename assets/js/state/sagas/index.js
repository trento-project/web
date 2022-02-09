import { get, post } from 'axios';
import { put, all, call, takeEvery, select } from 'redux-saga/effects';

import {
  setHosts,
  appendHost,
  updateHost,
  startHostsLoading,
  stopHostsLoading,
  setHeartbeatPassing,
  setHeartbeatCritical,
} from '../hosts';

import {
  setClusters,
  appendCluster,
  updateCluster,
  updateSelectedChecks,
  updateChecksResults,
  updateClusterHealth,
  startClustersLoading,
  stopClustersLoading,
} from '../clusters';

import { setCatalog } from '../catalog';

import { appendEntryToLiveFeed } from '../liveFeed';
import { watchNotifications } from './notifications';

const notify = ({ text, icon }) => ({
  type: 'NOTIFICATION',
  payload: { text, icon },
});

const getClusterName = (clusterID) => (state) => {
  return state.clustersList.clusters.reduce((acc, cluster) => {
    if (cluster.id === clusterID) {
      acc = cluster.name;
    }
    return acc;
  }, '');
};

function* initialDataFetch() {
  yield put(startHostsLoading());
  const { data: hosts } = yield call(get, '/api/hosts');
  yield put(setHosts(hosts));
  yield put(stopHostsLoading());

  yield put(startClustersLoading());
  const { data: clusters } = yield call(get, '/api/clusters');
  yield put(setClusters(clusters));
  yield put(stopClustersLoading());

  const { data: catalog } = yield call(get, '/api/checks/catalog');
  yield put(setCatalog(catalog));
}

function* hostRegistered({ payload }) {
  yield put(appendHost(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.hostname,
      message: 'New host registered.',
    })
  );
  yield put(
    notify({
      text: `A new host, ${payload.hostname}, has been discovered.`,
      icon: '🖖',
    })
  );
}

function* watchHostRegistered() {
  yield takeEvery('HOST_REGISTERED', hostRegistered);
}

function* hostDetailsUpdated({ payload }) {
  yield put(updateHost(payload));
}

function* watchHostDetailsUpdated() {
  yield takeEvery('HOST_DETAILS_UPDATED', hostDetailsUpdated);
}

function* heartbeatSucceded({ payload }) {
  yield put(setHeartbeatPassing(payload));
  yield put(
    notify({
      text: `The host ${payload.hostname} heartbeat is alive.`,
      icon: '❤️',
    })
  );
}

function* watchHeartbeatSucceded() {
  yield takeEvery('HEARTBEAT_SUCCEDED', heartbeatSucceded);
}

function* heartbeatFailed({ payload }) {
  yield put(setHeartbeatCritical(payload));
  yield put(
    notify({
      text: `The host ${payload.hostname} heartbeat is failing.`,
      icon: '💔',
    })
  );
}

function* watchHeartbeatFailed() {
  yield takeEvery('HEARTBEAT_FAILED', heartbeatFailed);
}

function* clusterRegistered({ payload }) {
  yield put(appendCluster(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.name,
      message: 'New cluster registered.',
    })
  );
  yield put(
    notify({
      text: `A new cluster, ${payload.name}, has been discovered.`,
      icon: '🖖',
    })
  );
}

function* watchClusterRegistered() {
  yield takeEvery('CLUSTER_REGISTERED', clusterRegistered);
}

function* clusterDetailsUpdated({ payload }) {
  yield put(updateCluster(payload));
}

function* watchClusterDetailsUpdated() {
  yield takeEvery('CLUSTER_DETAILS_UPDATED', clusterDetailsUpdated);
}

function* checksSelected({ payload }) {
  yield put(updateSelectedChecks(payload));

  yield call(post, `/api/clusters/${payload.clusterID}/checks`, {
    checks: payload.checks,
  });

  const clusterName = yield select(getClusterName(payload.clusterID));
  yield put(
    appendEntryToLiveFeed({
      source: clusterName,
      message: 'Checks selection changed.',
    })
  );

  yield put(
    notify({
      text: `Checks selection saved`,
      icon: '💾',
    })
  );
}

function* watchChecksSelected() {
  yield takeEvery('CHECKS_SELECTED', checksSelected);
}

function* requestChecksExecution({ payload }) {
  const clusterName = yield select(getClusterName(payload.clusterID));

  yield put(updateSelectedChecks(payload));

  yield call(
    post,
    `/api/clusters/${payload.clusterID}/checks/request_execution`,
    {}
  );

  yield put(
    appendEntryToLiveFeed({
      source: clusterName,
      message: 'Checks execution requested.',
    })
  );

  yield put(
    notify({
      text: `Checks execution requested, cluster: ${clusterName}`,
      icon: '🐰',
    })
  );
}

function* watchRequestChecksExecution() {
  yield takeEvery('REQUEST_CHECKS_EXECUTION', requestChecksExecution);
}

function* checksExecutionStarted({ payload }) {
  const clusterName = yield select(getClusterName(payload.cluster_id));

  yield put(
    appendEntryToLiveFeed({
      source: clusterName,
      message: 'Checks execution started.',
    })
  );

  yield put(
    notify({
      text: `Checks execution started, cluster: ${clusterName}`,
      icon: '🐰',
    })
  );
}

function* watchChecksExecutionStarted() {
  yield takeEvery('CHECKS_EXECUTION_STARTED', checksExecutionStarted);
}

function* checksExecutionCompleted({ payload }) {
  const clusterName = yield select(getClusterName(payload.cluster_id));

  yield put(
    appendEntryToLiveFeed({
      source: clusterName,
      message: 'Checks execution completed.',
    })
  );

  yield put(
    notify({
      text: `Checks execution completed, cluster: ${clusterName}`,
      icon: '🐇',
    })
  );
}

function* watchChecksExecutionCompleted() {
  yield takeEvery('CHECKS_EXECUTION_COMPLETED', checksExecutionCompleted);
}

function* checksResultsUpdated({ payload }) {
  yield put(updateChecksResults(payload));
}

function* watchChecksResultsUpdated() {
  yield takeEvery('CHECKS_RESULTS_UPDATED', checksResultsUpdated);
}

function* clusterHealthChanged({ payload }) {
  yield put(updateClusterHealth(payload));
}

function* watchClusterHealthChanged() {
  yield takeEvery('CLUSTER_HEALTH_CHANGED', clusterHealthChanged);
}

export default function* rootSaga() {
  yield all([
    initialDataFetch(),
    watchHostRegistered(),
    watchHostDetailsUpdated(),
    watchHeartbeatSucceded(),
    watchHeartbeatFailed(),
    watchClusterRegistered(),
    watchClusterDetailsUpdated(),
    watchNotifications(),
    watchChecksSelected(),
    watchRequestChecksExecution(),
    watchChecksExecutionStarted(),
    watchChecksExecutionCompleted(),
    watchChecksResultsUpdated(),
    watchClusterHealthChanged(),
  ]);
}
