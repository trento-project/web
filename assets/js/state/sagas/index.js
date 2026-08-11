// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

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

import { initSocketConnection } from '@lib/network/socket';

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
  CLUSTER_STALE_CHANGED,
  setClusters,
  startClustersLoading,
  stopClustersLoading,
} from '@state/clusters';

import {
  SAP_SYSTEM_REGISTERED,
  SAP_SYSTEM_HEALTH_CHANGED,
  SAP_SYSTEM_DEREGISTERED,
  SAP_SYSTEM_RESTORED,
  SAP_SYSTEM_STALE_CHANGED,
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
  DATABASE_STALE_CHANGED,
  setDatabases,
  startDatabasesLoading,
  stopDatabasesLoading,
} from '@state/databases';

import { SET_USER_AS_LOGGED } from '@state/user';

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
import { watchActivityLogsSettings } from '@state/sagas/activityLogsSettings';
import { watchSoftwareUpdates } from '@state/sagas/softwareUpdates';

import { watchSocketEvents } from '@state/sagas/channels';
import { watchActivityLogActions } from '@state/sagas/activityLog';
import { checkApiKeyExpiration } from '@state/sagas/settings';
import { watchOperationEvents } from '@state/sagas/operations';

const RESET_STATE = 'RESET_STATE';

const HEALTH_SUMMARY_REFRESH_EVENTS = [
  HOST_REGISTERED,
  CLUSTER_REGISTERED,
  DATABASE_REGISTERED,
  SAP_SYSTEM_REGISTERED,
  HEARTBEAT_FAILED,
  HEARTBEAT_SUCCEDED,
  DATABASE_HEALTH_CHANGED,
  SAP_SYSTEM_HEALTH_CHANGED,
  CLUSTER_HEALTH_CHANGED,
  SAP_SYSTEM_DEREGISTERED,
  CLUSTER_DEREGISTERED,
  HOST_HEALTH_CHANGED,
  HOST_DEREGISTERED,
  HOST_RESTORED,
  DATABASE_RESTORED,
  CLUSTER_RESTORED,
  SAP_SYSTEM_RESTORED,
  DATABASE_STALE_CHANGED,
  CLUSTER_STALE_CHANGED,
  SAP_SYSTEM_STALE_CHANGED,
];

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
  const socket = yield call(initSocketConnection);
  yield call(watchSocketEvents, socket);
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
    HEALTH_SUMMARY_REFRESH_EVENTS,
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
    watchActivityLogsSettings(),
    watchSoftwareUpdates(),
    watchActivityLogActions(),
    watchOperationEvents(),
  ]);
}
