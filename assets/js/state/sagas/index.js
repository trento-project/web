import { get, post } from '@lib/network';
import {
  put,
  all,
  call,
  fork,
  takeEvery,
  select,
  debounce,
  takeLatest,
} from 'redux-saga/effects';
import { keysToCamel } from '@lib/serialization';

import {
  setHosts,
  appendHost,
  updateHost,
  setHeartbeatPassing,
  setHeartbeatCritical,
  setHostNotDeregisterable,
  startHostsLoading,
  stopHostsLoading,
  checkHostIsDeregisterable,
  cancelCheckHostIsDeregisterable,
} from '@state/hosts';

import {
  setClusters,
  appendCluster,
  updateCluster,
  updateCibLastWritten,
  updateSelectedChecks,
  updateChecksResults,
  updateClusterHealth,
  startClustersLoading,
  stopClustersLoading,
} from '@state/clusters';

import {
  SAP_SYSTEM_REGISTERED,
  SAP_SYSTEM_HEALTH_CHANGED,
  startSapSystemsLoading,
  stopSapSystemsLoading,
  setSapSystems,
} from '@state/sapSystems';

import {
  startHealthSummaryLoading,
  stopHealthSummaryLoading,
  setHealthSummary,
} from '@state/healthSummary';

import {
  DATABASE_REGISTERED,
  DATABASE_HEALTH_CHANGED,
  setDatabases,
  startDatabasesLoading,
  stopDatabasesLoading,
} from '@state/databases';

import { appendEntryToLiveFeed } from '@state/liveFeed';
import { setEulaVisible, setIsPremium } from '@state/settings';

import { watchNotifications } from '@state/sagas/notifications';
import { watchAcceptEula } from '@state/sagas/eula';
import { watchCatalogUpdate } from '@state/sagas/catalog';
import { watchSapSystem } from '@state/sagas/sapSystems';
import { watchDatabase } from '@state/sagas/databases';
import {
  markDeregisterableHosts,
  watchHostDeregistered,
  watchHostDeregisterable,
} from '@state/sagas/hosts';
import { watchClusterDeregistered } from '@state/sagas/clusters';

import {
  watchUpdateLastExecution,
  watchRequestExecution,
} from '@state/sagas/lastExecutions';
import { watchPerformLogin } from '@state/sagas/user';

import { getClusterName } from '@state/selectors/cluster';
import {
  setClusterChecksSelectionSavingError,
  setClusterChecksSelectionSavingSuccess,
  startSavingClusterChecksSelection,
  stopSavingClusterChecksSelection,
} from '@state/clusterChecksSelection';

import { CHECKS_SELECTED } from '@state/actions/cluster';
import { notify } from '@state/actions/notifications';
import { initSocketConnection } from '@lib/network/socket';
import processChannelEvents from '@state/channels';
import { store } from '@state';

// eslint-disable-next-line no-undef
const deregistrationDebounce = config.deregistrationDebounce ?? 0;

function* loadSapSystemsHealthSummary() {
  yield put(startHealthSummaryLoading());
  const { data: healthSummary } = yield call(get, '/sap_systems/health');

  yield put(setHealthSummary(keysToCamel(healthSummary)));
  yield put(stopHealthSummaryLoading());
}

function* initialDataFetch() {
  yield loadSapSystemsHealthSummary();

  const {
    data: { eula_accepted, premium_subscription },
  } = yield call(get, '/settings');

  if (!eula_accepted) {
    yield put(setEulaVisible());
  }

  if (premium_subscription) {
    yield put(setIsPremium());
  }

  yield put(startHostsLoading());
  const { data: hosts } = yield call(get, '/hosts');
  yield put(setHosts(hosts));
  yield fork(markDeregisterableHosts, hosts);
  yield put(stopHostsLoading());

  yield put(startClustersLoading());
  const { data: clusters } = yield call(get, '/clusters', {
    baseURL: '/api/v2',
  });
  yield put(setClusters(clusters));
  yield put(stopClustersLoading());

  yield put(startSapSystemsLoading());
  const { data: sapSystems } = yield call(get, '/sap_systems');
  yield put(setSapSystems(sapSystems));
  yield put(stopSapSystemsLoading());

  yield put(startDatabasesLoading());
  const { data: databases } = yield call(get, '/databases');
  yield put(setDatabases(databases));
  yield put(stopDatabasesLoading());
}

function* setupSocketEvents() {
  const socket = initSocketConnection();
  yield call(processChannelEvents, store, socket);
}

function* watchUserLoggedIn() {
  yield all([
    takeLatest('user/setUserAsLogged', initialDataFetch),
    takeLatest('user/setUserAsLogged', setupSocketEvents),
  ]);
}

function* watchResetState() {
  yield takeEvery('RESET_STATE', initialDataFetch);
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
      icon: 'ℹ️',
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
  yield put(setHostNotDeregisterable(payload));
  yield put(cancelCheckHostIsDeregisterable(payload));
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
    checkHostIsDeregisterable({ ...payload, debounce: deregistrationDebounce })
  );
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
      icon: 'ℹ️',
    })
  );
}

function* watchClusterRegistered() {
  yield takeEvery('CLUSTER_REGISTERED', clusterRegistered);
}

function* cibLastWrittenUpdated({ payload }) {
  yield put(updateCibLastWritten(payload));
}

function* watchClusterCibLastWrittenUpdated() {
  yield takeEvery('CLUSTER_CIB_LAST_WRITTEN_UPDATED', cibLastWrittenUpdated);
}

function* clusterDetailsUpdated({ payload }) {
  yield put(updateCluster(payload));
}

function* watchClusterDetailsUpdated() {
  yield takeEvery('CLUSTER_DETAILS_UPDATED', clusterDetailsUpdated);
}

function* checksSelected({ payload }) {
  yield put(startSavingClusterChecksSelection());

  try {
    yield call(post, `/clusters/${payload.clusterID}/checks`, {
      checks: payload.checks,
    });
    yield put(updateSelectedChecks(payload));

    const clusterName = yield select(getClusterName(payload.clusterID));
    yield put(
      appendEntryToLiveFeed({
        source: clusterName,
        message: 'Checks selection changed.',
      })
    );

    yield put(
      notify({
        text: 'Checks selection saved',
        icon: '💾',
      })
    );
    yield put(setClusterChecksSelectionSavingSuccess());
  } catch (error) {
    yield put(setClusterChecksSelectionSavingError());
  }
  yield put(stopSavingClusterChecksSelection());
}

function* watchChecksSelected() {
  yield takeEvery(CHECKS_SELECTED, checksSelected);
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

function* refreshHealthSummaryOnComnponentsHealthChange() {
  const debounceDuration = 5000;

  yield debounce(
    debounceDuration,
    'HOST_REGISTERED',
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    'CLUSTER_REGISTERED',
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    DATABASE_REGISTERED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    SAP_SYSTEM_REGISTERED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    'HEARTBEAT_FAILED',
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    'HEARTBEAT_SUCCEDED',
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    DATABASE_HEALTH_CHANGED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    SAP_SYSTEM_HEALTH_CHANGED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    'CLUSTER_HEALTH_CHANGED',
    loadSapSystemsHealthSummary
  );
}

export default function* rootSaga() {
  yield all([
    watchUserLoggedIn(),
    watchResetState(),
    watchHostRegistered(),
    watchHostDetailsUpdated(),
    watchHeartbeatSucceded(),
    watchHeartbeatFailed(),
    watchHostDeregistered(),
    watchClusterRegistered(),
    watchClusterDetailsUpdated(),
    watchClusterCibLastWrittenUpdated(),
    watchClusterDeregistered(),
    watchNotifications(),
    watchChecksSelected(),
    watchChecksExecutionStarted(),
    watchChecksExecutionCompleted(),
    watchChecksResultsUpdated(),
    watchClusterHealthChanged(),
    watchSapSystem(),
    watchDatabase(),
    watchCatalogUpdate(),
    watchUpdateLastExecution(),
    watchRequestExecution(),
    watchAcceptEula(),
    refreshHealthSummaryOnComnponentsHealthChange(),
    watchPerformLogin(),
    watchHostDeregisterable(),
  ]);
}
