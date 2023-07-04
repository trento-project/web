import {
  all,
  delay,
  put,
  race,
  call,
  take,
  takeEvery,
} from 'redux-saga/effects';
import {
  CHECK_HOST_IS_DEREGISTERABLE,
  CANCEL_CHECK_HOST_IS_DEREGISTERABLE,
  HOST_DEREGISTERED,
  removeHost,
  setHostDeregisterable,
} from '@state/hosts';
import { notify } from '@state/actions/notifications';

export function* markDeregisterableHosts(hosts) {
  yield all(
    hosts
      .filter(({ heartbeat }) => heartbeat !== 'passing')
      .map((host) =>
        put({
          type: CHECK_HOST_IS_DEREGISTERABLE,
          payload: host,
        })
      )
  );
}

function* hostDeregisterable(payload) {
  // eslint-disable-next-line no-undef
  yield delay(config.deregistrationDebounce ?? 0);
  yield put(setHostDeregisterable(payload));
}

const matchHost =
  (hostId) =>
  ({ type, payload }) =>
    type === CANCEL_CHECK_HOST_IS_DEREGISTERABLE && hostId === payload.id;

function* checkHostIsDeregisterable({ payload }) {
  yield race({
    response: call(hostDeregisterable, payload),
    cancel: take(matchHost(payload.id)),
  });
}

export function* watchHostDeregisterable() {
  yield takeEvery(CHECK_HOST_IS_DEREGISTERABLE, checkHostIsDeregisterable);
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

export function* watchHostDeregistered() {
  yield takeEvery(HOST_DEREGISTERED, hostDeregistered);
}
