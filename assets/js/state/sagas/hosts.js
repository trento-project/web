import { delay, put, race, call, take, takeEvery } from 'redux-saga/effects';
import { del } from '@lib/network';

import {
  CHECK_HOST_IS_DEREGISTERABLE,
  CANCEL_CHECK_HOST_IS_DEREGISTERABLE,
  HOST_DEREGISTERED,
  DEREGISTER_HOST,
  HOST_RESTORED,
  HOST_HEALTH_CHANGED,
  SAPTUNE_STATUS_UPDATED,
  removeHost,
  setHostListDeregisterable,
  setHostDeregistering,
  unsetHostDeregistering,
  appendHost,
  updateHostHealth,
  updateSaptuneStatus,
} from '@state/hosts';

import { notify } from '@state/sagas/notifications';

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

export function* deregisterHost({
  payload,
  payload: { id, hostname, navigate },
}) {
  yield put(setHostDeregistering(payload));
  try {
    yield call(del, `/hosts/${id}`);
    navigate('/hosts');
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

export function* watchHostDeregisterable() {
  yield takeEvery(CHECK_HOST_IS_DEREGISTERABLE, checkHostDeregisterable);
}

export function* watchHostDeregistered() {
  yield takeEvery(HOST_DEREGISTERED, hostDeregistered);
}

export function* watchDeregisterHost() {
  yield takeEvery(DEREGISTER_HOST, deregisterHost);
}

export function* watchHostRestored() {
  yield takeEvery(HOST_RESTORED, hostRestored);
}

export function* watchSaptuneStatusUpdated() {
  yield takeEvery(SAPTUNE_STATUS_UPDATED, saptuneStatusUpdated);
}

export function* watchHostHealthChanged() {
  yield takeEvery(HOST_HEALTH_CHANGED, hostHealthChanged);
}
