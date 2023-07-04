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
  DEREGISTER_HOST,
  CANCEL_DEREGISTER_HOST,
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
          type: DEREGISTER_HOST,
          payload: host,
        })
      )
  );
}

function* deregisterHostDetail(payload) {
  // eslint-disable-next-line no-undef
  yield delay(config.deregistrationDebounce ?? 0);
  yield put(setHostDeregisterable(payload));
}

function* deregisterHost({ payload }) {
  yield race({
    response: call(deregisterHostDetail, payload),
    cancel: take(
      ({ type, payload: cancelPayload }) =>
        type === CANCEL_DEREGISTER_HOST && cancelPayload.id === payload.id
    ),
  });
}

export function* watchDeregisterHost() {
  yield takeEvery(DEREGISTER_HOST, deregisterHost);
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
