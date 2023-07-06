import { delay, put, race, call, take, takeEvery } from 'redux-saga/effects';
import {
  CHECK_HOST_IS_DEREGISTERABLE,
  CANCEL_CHECK_HOST_IS_DEREGISTERABLE,
  HOST_DEREGISTERED,
  removeHost,
  setHostsDeregisterable,
} from '@state/hosts';
import { notify } from '@state/actions/notifications';

export function* markDeregisterableHosts(hosts) {
  yield put(
    setHostsDeregisterable(
      hosts.filter(({ heartbeat }) => heartbeat !== 'passing')
    )
  );
}

export function* hostDeregisterable(debounce, host) {
  yield delay(debounce);
  yield put(setHostsDeregisterable([host]));
}

export const matchHost =
  (hostId) =>
  ({ type, payload }) =>
    type === CANCEL_CHECK_HOST_IS_DEREGISTERABLE && hostId === payload.id;

export function* checkHostDeregisterable(debounce, { payload }) {
  yield race({
    response: call(hostDeregisterable, debounce, payload),
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

export function* watchHostDeregisterable(debounce) {
  yield takeEvery(
    CHECK_HOST_IS_DEREGISTERABLE,
    checkHostDeregisterable,
    debounce
  );
}

export function* watchHostDeregistered() {
  yield takeEvery(HOST_DEREGISTERED, hostDeregistered);
}
