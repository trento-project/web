import {
  delay,
  put,
  race,
  call,
  take,
  takeEvery,
  getContext,
} from 'redux-saga/effects';
import { del } from '@lib/network';

import {
  DEREGISTRATION_DEBOUNCE,
  HOST_REGISTERED,
  HOST_DETAILS_UPDATED,
  HEARTBEAT_SUCCEDED,
  HEARTBEAT_FAILED,
  CHECK_HOST_IS_DEREGISTERABLE,
  CANCEL_CHECK_HOST_IS_DEREGISTERABLE,
  HOST_DEREGISTERED,
  DEREGISTER_HOST,
  HOST_RESTORED,
  HOST_HEALTH_CHANGED,
  SAPTUNE_STATUS_UPDATED,
  HOST_SOFTWARE_UPDATES_DISCOVERY_COMPLETED,
  removeHost,
  setHostListDeregisterable,
  setHostDeregistering,
  unsetHostDeregistering,
  appendHost,
  updateHost,
  updateHostHealth,
  updateSaptuneStatus,
  setHeartbeatPassing,
  setHeartbeatCritical,
  setHostNotDeregisterable,
  checkHostIsDeregisterable,
  cancelCheckHostIsDeregisterable,
} from '@state/hosts';

import { fetchSoftwareUpdatesSettings } from '@state/softwareUpdatesSettings';
import { fetchSoftwareUpdates } from '@state/softwareUpdates';

import { notify } from '@state/notifications';

function* hostRegistered({ payload }) {
  yield put(appendHost(payload));
  yield put(
    notify({
      text: `A new host, ${payload.hostname}, has been discovered.`,
      icon: 'ℹ️',
    })
  );
}

function* hostDetailsUpdated({ payload }) {
  yield put(updateHost(payload));
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

function* heartbeatFailed({ payload }) {
  yield put(setHeartbeatCritical(payload));
  yield put(
    checkHostIsDeregisterable({ ...payload, debounce: DEREGISTRATION_DEBOUNCE })
  );
  yield put(
    notify({
      text: `The host ${payload.hostname} heartbeat is failing.`,
      icon: '💔',
    })
  );
}

export function* markDeregisterableHosts(hosts) {
  yield put(
    setHostListDeregisterable(
      hosts.filter(({ heartbeat }) => heartbeat !== 'passing')
    )
  );
}

function* hostDeregisterable({ debounce, id }) {
  yield delay(debounce);
  yield put(setHostListDeregisterable([{ id }]));
}

export const matchHost =
  (hostId) =>
  ({ type, payload }) =>
    type === CANCEL_CHECK_HOST_IS_DEREGISTERABLE && hostId === payload.id;

export function* checkHostDeregisterable({ payload }) {
  yield race({
    response: call(hostDeregisterable, payload),
    cancel: take(matchHost(payload.id)),
  });
}

export function* hostDeregistered({ payload }) {
  yield put(removeHost(payload));
  yield put(
    notify({
      text: `The host ${payload.hostname} has been deregistered.`,
      icon: 'ℹ️',
    })
  );
}

export function* deregisterHost({ payload, payload: { id, hostname } }) {
  yield put(setHostDeregistering(payload));
  const router = yield getContext('router');
  try {
    yield call(del, `/hosts/${id}`);
    yield call(router.navigate, '/hosts');
  } catch (error) {
    yield put(
      notify({
        text: `Error deregistering host ${hostname}.`,
        icon: '❌',
      })
    );
  } finally {
    yield put(unsetHostDeregistering(payload));
  }
}

export function* hostRestored({ payload }) {
  yield put(appendHost(payload));
  yield put(
    notify({
      text: `Host ${payload.hostname} has been restored.`,
      icon: 'ℹ️',
    })
  );
}

export function* saptuneStatusUpdated({ payload: host }) {
  const { hostname } = host;
  yield put(updateSaptuneStatus(host));
  yield put(
    notify({
      text: `Saptune status updated in host ${hostname}.`,
      icon: 'ℹ️',
    })
  );
}

export function* hostHealthChanged({ payload: { id, hostname, health } }) {
  yield put(updateHostHealth({ id, health }));
  yield put(
    notify({
      text: `Host ${hostname} health changed to ${health}.`,
      icon: 'ℹ️',
    })
  );
}

export function* hostSoftwareUpdatesDiscoveryCompleted({ payload: { id } }) {
  yield put(fetchSoftwareUpdatesSettings());
  yield put(fetchSoftwareUpdates(id));
}

export function* watchHostEvents() {
  yield takeEvery(HOST_REGISTERED, hostRegistered);
  yield takeEvery(HOST_DETAILS_UPDATED, hostDetailsUpdated);
  yield takeEvery(HEARTBEAT_SUCCEDED, heartbeatSucceded);
  yield takeEvery(HEARTBEAT_FAILED, heartbeatFailed);
  yield takeEvery(CHECK_HOST_IS_DEREGISTERABLE, checkHostDeregisterable);
  yield takeEvery(HOST_DEREGISTERED, hostDeregistered);
  yield takeEvery(DEREGISTER_HOST, deregisterHost);
  yield takeEvery(HOST_RESTORED, hostRestored);
  yield takeEvery(SAPTUNE_STATUS_UPDATED, saptuneStatusUpdated);
  yield takeEvery(HOST_HEALTH_CHANGED, hostHealthChanged);
  yield takeEvery(
    HOST_SOFTWARE_UPDATES_DISCOVERY_COMPLETED,
    hostSoftwareUpdatesDiscoveryCompleted
  );
}
