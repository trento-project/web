import { delay, put, takeEvery } from 'redux-saga/effects';
import {
  HOST_DEREGISTERED,
  removeHost,
  setHostDeregisterable,
} from '@state/hosts';
import { notify } from '@state/actions/notifications';

export function* hostDeregisterable({ payload }) {
  // eslint-disable-next-line no-undef
  yield delay(config.deregistrationDebounce ?? 0);
  yield put(setHostDeregisterable(payload));
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
