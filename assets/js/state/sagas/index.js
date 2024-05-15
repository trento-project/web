import { get } from '@lib/network';
import {
  put,
  all,
  call,
  fork,
  takeEvery,
  debounce,
  takeLatest,
} from 'redux-saga/effects';

import {
  HOST_REGISTERED,
  HEARTBEAT_SUCCEDED,
  HEARTBEAT_FAILED,
  HOST_DEREGISTERED,
  HOST_RESTORED,
  HOST_HEALTH_CHANGED,
  setHosts,
  startHostsLoading,
  stopHostsLoading,
} from '@state/hosts';

import {
  CLUSTER_REGISTERED,
  CLUSTER_DEREGISTERED,
  CLUSTER_RESTORED,
  CLUSTER_HEALTH_CHANGED,
  setClusters,
  startClustersLoading,
  stopClustersLoading,
} from '@state/clusters';

import {
  SAP_SYSTEM_REGISTERED,
  SAP_SYSTEM_HEALTH_CHANGED,
  SAP_SYSTEM_DEREGISTERED,
  SAP_SYSTEM_RESTORED,
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
  DATABASE_RESTORED,
  DATABASE_HEALTH_CHANGED,
  setDatabases,
  startDatabasesLoading,
  stopDatabasesLoading,
} from '@state/databases';

import { SET_USER_AS_LOGGED } from '@state/user';

import { setIsPremium } from '@state/settings';

import { watchNotifications } from '@state/sagas/notifications';

import { watchCatalogEvents } from '@state/sagas/catalog';
import { watchClusterEvents } from '@state/sagas/clusters';
import { watchDatabaseEvents } from '@state/sagas/databases';
import { markDeregisterableHosts, watchHostEvents } from '@state/sagas/hosts';
import { watchLastExecutionEvents } from '@state/sagas/lastExecutions';
import { watchSapSystemEvents } from '@state/sagas/sapSystems';

import {
  watchUserActions,
  checkUserPasswordChangeRequested,
} from '@state/sagas/user';
import { watchChecksSelectionEvents } from '@state/sagas/checksSelection';
import { watchSoftwareUpdateSettings } from '@state/sagas/softwareUpdatesSettings';
import { watchSoftwareUpdates } from '@state/sagas/softwareUpdates';

import { initSocketConnection } from '@lib/network/socket';
import processChannelEvents from '@state/channels';
import { store } from '@state';
import { checkApiKeyExpiration } from '@state/sagas/settings';

const RESET_STATE = 'RESET_STATE';

function* loadSapSystemsHealthSummary() {
  yield put(startHealthSummaryLoading());
  const { data: healthSummary } = yield call(get, '/sap_systems/health');

  yield put(setHealthSummary(healthSummary));
  yield put(stopHealthSummaryLoading());
}

function* initialDataFetch() {
  yield loadSapSystemsHealthSummary();

  yield fork(checkApiKeyExpiration);

  yield fork(checkUserPasswordChangeRequested);

  const {
    data: { premium_subscription },
  } = yield call(get, '/settings');

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
    takeLatest(SET_USER_AS_LOGGED, initialDataFetch),
    takeLatest(SET_USER_AS_LOGGED, setupSocketEvents),
  ]);
}

function* watchResetState() {
  yield takeEvery(RESET_STATE, initialDataFetch);
}

function* refreshHealthSummaryOnComponentsHealthChange() {
  const debounceDuration = 5000;

  yield debounce(
    debounceDuration,
    HOST_REGISTERED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    CLUSTER_REGISTERED,
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
    HEARTBEAT_FAILED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    HEARTBEAT_SUCCEDED,
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
    CLUSTER_HEALTH_CHANGED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    SAP_SYSTEM_DEREGISTERED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    CLUSTER_DEREGISTERED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    HOST_HEALTH_CHANGED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    HOST_DEREGISTERED,
    loadSapSystemsHealthSummary
  );
  yield debounce(debounceDuration, HOST_RESTORED, loadSapSystemsHealthSummary);
  yield debounce(
    debounceDuration,
    DATABASE_RESTORED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    CLUSTER_RESTORED,
    loadSapSystemsHealthSummary
  );
  yield debounce(
    debounceDuration,
    SAP_SYSTEM_RESTORED,
    loadSapSystemsHealthSummary
  );
}

export default function* rootSaga() {
  yield all([
    refreshHealthSummaryOnComponentsHealthChange(),
    watchCatalogEvents(),
    watchChecksSelectionEvents(),
    watchClusterEvents(),
    watchDatabaseEvents(),
    watchHostEvents(),
    watchLastExecutionEvents(),
    watchNotifications(),
    watchUserActions(),
    watchResetState(),
    watchSapSystemEvents(),
    watchUserLoggedIn(),
    watchSoftwareUpdateSettings(),
    watchSoftwareUpdates(),
  ]);
}
