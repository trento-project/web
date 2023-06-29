import { put, takeEvery } from 'redux-saga/effects';
import { HOST_DEREGISTERED, removeHost } from '@state/hosts';
import { notify } from '@state/actions/notifications';

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
