import { delay, put, race, call, take, takeEvery } from 'redux-saga/effects';
import {
  CHECK_HOST_IS_DEREGISTERABLE,
  CANCEL_CHECK_HOST_IS_DEREGISTERABLE,
  HOST_DEREGISTERED,
  DEREGISTER_HOST,
  removeHost,
  setHostListDeregisterable,
  setHostDeregistering,
  setHostNotDeregistering,
} from '@state/hosts';

import { del } from '@lib/network';
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

export function* deregisterHost({ payload }) {
  yield put(setHostDeregistering(payload));
  try {
    yield call(del, `/hosts/${payload.id}`);
  } catch (error) {
    yield put(
      notify({
        text: `Error deregistering host ${payload?.hostname}.`,
        icon: '❌',
      })
    );
  } finally {
    yield put(setHostNotDeregistering(payload));
  }
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
