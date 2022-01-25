import { get } from 'axios';
import { put, all, call, takeEvery } from 'redux-saga/effects';

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
  startClustersLoading,
  stopClustersLoading,
} from '../clusters';

import { appendEntryToLiveFeed } from '../liveFeed';
import { watchNotifications } from './notifications';

const notify = ({ text, icon }) => ({
  type: 'NOTIFICATION',
  payload: { text, icon },
});

function* initialDataFetch() {
  yield put(startHostsLoading());
  const { data: hosts } = yield call(get, '/api/hosts');
  yield put(setHosts(hosts));
  yield put(stopHostsLoading());

  yield put(startClustersLoading());
  const { data: clusters } = yield call(get, '/api/clusters');
  yield put(setClusters(clusters));
  yield put(stopClustersLoading());
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
  ]);
}
