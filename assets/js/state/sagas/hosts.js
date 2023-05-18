import { put, takeEvery } from 'redux-saga/effects';
import { HOST_DEREGISTERED, removeHost } from '@state/hosts';
import { appendEntryToLiveFeed } from '@state/liveFeed';
import { notify } from '@state/actions/notifications';

export function* hostDeregistered({ payload }) {
  yield put(removeHost(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.hostname,
      message: 'Host deregistered.',
    })
  );
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
