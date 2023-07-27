import { delay, put, race, call, take, takeEvery } from 'redux-saga/effects';
import { del } from '@lib/network';

import {
  CHECK_HOST_IS_DEREGISTERABLE,
  CANCEL_CHECK_HOST_IS_DEREGISTERABLE,
  HOST_DEREGISTERED,
  DEREGISTER_HOST,
  HOST_RESTORED,
  removeHost,
  setHostListDeregisterable,
  setHostDeregistering,
  setHostNotDeregistering,
  appendHost,
} from '@state/hosts';

import { notify } from '@state/actions/notifications';

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
    yield put(setHostNotDeregistering(payload));
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
