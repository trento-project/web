import { get, post } from 'axios';
import { put, all, call, takeEvery, select } from 'redux-saga/effects';
import { urlEncode, keysToCamel } from '@lib/serialization';

import {
  setHosts,
  appendHost,
  updateHost,
  startHostsLoading,
  stopHostsLoading,
  setHeartbeatPassing,
  setHeartbeatCritical,
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
  startSapSystemsLoading,
  stopSapSystemsLoading,
  setSapSystems,
  appendSapsystem,
  appendDatabaseInstanceToSapSystem,
  appendApplicationInstance,
  updateSapSystemHealth,
  updateSAPSystemDatabaseInstanceHealth,
  updateSAPSystemDatabaseInstanceSystemReplication,
  updateApplicationInstanceHealth,
} from '@state/sapSystems';

import {
  startHealthSummaryLoading,
  stopHealthSummaryLoading,
  setHealthSummary,
} from '@state/healthSummary';

import {
  appendDatabase,
  appendDatabaseInstance,
  setDatabases,
  startDatabasesLoading,
  stopDatabasesLoading,
  updateDatabaseHealth,
  updateDatabaseInstanceHealth,
  updateDatabaseInstanceSystemReplication,
} from '@state/databases';

import { setCatalog } from '@state/catalog';

import { appendEntryToLiveFeed } from '@state/liveFeed';
import { setEulaVisible } from '@state/settings';

import { watchNotifications } from '@state/sagas/notifications';
import { watchAcceptEula } from '@state/sagas/eula';

import { getDatabase, getSapSystem } from '@state/selectors';

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

function* loadSapSystemsHealthSummary() {
  yield put(startHealthSummaryLoading());
  const { data: healthSummary } = yield call(get, '/api/sap_systems/health');

  yield put(setHealthSummary(keysToCamel(healthSummary)));
  yield put(stopHealthSummaryLoading());
}

function* initialDataFetch() {
  yield loadSapSystemsHealthSummary();

  const {
    data: { eula_accepted, premium_subscription },
  } = yield call(get, '/api/settings');

  if (!eula_accepted && premium_subscription) {
    yield put(setEulaVisible());
  }

  yield put(startHostsLoading());
  const { data: hosts } = yield call(get, '/api/hosts');
  yield put(setHosts(hosts));
  yield put(stopHostsLoading());

  yield put(startClustersLoading());
  const { data: clusters } = yield call(get, '/api/clusters');
  yield put(setClusters(clusters));
  yield put(stopClustersLoading());

  yield put(startSapSystemsLoading());
  const { data: sapSystems } = yield call(get, '/api/sap_systems');
  yield put(setSapSystems(sapSystems));
  yield put(stopSapSystemsLoading());

  yield put(startDatabasesLoading());
  const { data: databases } = yield call(get, '/api/databases');
  yield put(setDatabases(databases));
  yield put(stopDatabasesLoading());
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

function* sapSystemRegistered({ payload }) {
  yield put(appendSapsystem(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.sid,
      message: 'New SAP System registered.',
    })
  );
  yield put(
    notify({
      text: `A new SAP System, ${payload.sid}, has been discovered.`,
      icon: '🖖',
    })
  );
}

function* sapSystemHealthChanged({ payload }) {
  const sid =
    (yield select(getSapSystem(payload.id)))?.sid || 'unable to determine SID';

  yield put(updateSapSystemHealth(payload));
  yield put(
    appendEntryToLiveFeed({
      source: sid,
      message: `SAP System Health changed to ${payload.health}`,
    })
  );
  yield put(
    notify({
      text: `The SAP System ${sid} health is ${payload.health}!`,
      icon: 'ℹ️',
    })
  );
}

function* applicationInstanceRegistered({ payload }) {
  yield put(appendApplicationInstance(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.sid,
      message: 'New Application instance registered.',
    })
  );
}

function* applicationInstanceHealthChanged({ payload }) {
  yield put(updateApplicationInstanceHealth(payload));
}

function* watchSapSystem() {
  yield takeEvery('SAP_SYSTEM_REGISTERED', sapSystemRegistered);
  yield takeEvery('SAP_SYSTEM_HEALTH_CHANGED', sapSystemHealthChanged);
  yield takeEvery(
    'APPLICATION_INSTANCE_REGISTERED',
    applicationInstanceRegistered
  );
  yield takeEvery(
    'APPLICATION_INSTANCE_HEALTH_CHANGED',
    applicationInstanceHealthChanged
  );
}

function* databaseRegistered({ payload }) {
  yield put(appendDatabase(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.sid,
      message: 'New Databse registered.',
    })
  );
  yield put(
    notify({
      text: `A new Database, ${payload.sid}, has been discovered.`,
      icon: '🖖',
    })
  );
}

function* databaseHealthChanged({ payload }) {
  const sid =
    (yield select(getDatabase(payload.id)))?.sid || 'unable to determine SID';

  yield put(updateDatabaseHealth(payload));
  yield put(
    appendEntryToLiveFeed({
      source: sid,
      message: `Database Health changed to ${payload.health}`,
    })
  );
  yield put(
    notify({
      text: `The Database ${sid} health is ${payload.health}!`,
      icon: 'ℹ️',
    })
  );
}

function* databaseInstanceRegistered({ payload }) {
  yield put(appendDatabaseInstance(payload));
  yield put(appendDatabaseInstanceToSapSystem(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.sid,
      message: 'New Database instance registered.',
    })
  );
  yield put(
    notify({
      text: `A new Database instance, ${payload.sid}, has been discovered.`,
      icon: '🖖',
    })
  );
}

function* databaseInstanceHealthChanged({ payload }) {
  yield put(updateDatabaseInstanceHealth(payload));
  yield put(updateSAPSystemDatabaseInstanceHealth(payload));
}

function* databaseInstanceSystemReplicationChanged({ payload }) {
  yield put(updateDatabaseInstanceSystemReplication(payload));
  yield put(updateSAPSystemDatabaseInstanceSystemReplication(payload));
}

function* watchDatabase() {
  yield takeEvery('DATABASE_REGISTERED', databaseRegistered);
  yield takeEvery('DATABASE_HEALTH_CHANGED', databaseHealthChanged);
  yield takeEvery('DATABASE_INSTANCE_REGISTERED', databaseInstanceRegistered);
  yield takeEvery(
    'DATABASE_INSTANCE_HEALTH_CHANGED',
    databaseInstanceHealthChanged
  );
  yield takeEvery(
    'DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED',
    databaseInstanceSystemReplicationChanged
  );
}

function* updateCatalog({ payload }) {
  yield put(setCatalog({ loading: true }));
  try {
    const { data: catalog } = yield call(
      get,
      `/api/checks/catalog?${urlEncode(payload)}`
    );
    yield put(setCatalog(catalog));
  } catch (error) {
    yield put(
      setCatalog({
        error: error.response.data.error,
      })
    );
  }
}

function* watchCatalogUpdate() {
  yield takeEvery('UPDATE_CATALOG', updateCatalog);
}

function* refreshHealthSummaryOnComnponentsHealthChange() {
  yield takeEvery('HEARTBEAT_FAILED', loadSapSystemsHealthSummary);
  yield takeEvery('HEARTBEAT_SUCCEDED', loadSapSystemsHealthSummary);
  yield takeEvery('DATABASE_HEALTH_CHANGED', loadSapSystemsHealthSummary);
  yield takeEvery('SAP_SYSTEM_HEALTH_CHANGED', loadSapSystemsHealthSummary);
  yield takeEvery('CLUSTER_HEALTH_CHANGED', loadSapSystemsHealthSummary);
}

export default function* rootSaga() {
  yield all([
    initialDataFetch(),
    watchResetState(),
    watchHostRegistered(),
    watchHostDetailsUpdated(),
    watchHeartbeatSucceded(),
    watchHeartbeatFailed(),
    watchClusterRegistered(),
    watchClusterDetailsUpdated(),
    watchClusterCibLastWrittenUpdated(),
    watchNotifications(),
    watchChecksSelected(),
    watchRequestChecksExecution(),
    watchChecksExecutionStarted(),
    watchChecksExecutionCompleted(),
    watchChecksResultsUpdated(),
    watchClusterHealthChanged(),
    watchSapSystem(),
    watchDatabase(),
    watchCatalogUpdate(),
    watchAcceptEula(),
    refreshHealthSummaryOnComnponentsHealthChange(),
  ]);
}
