import { get } from 'axios';
import { put, all, call, takeEvery } from 'redux-saga/effects';

import { appendHost, setHosts, startLoading, stopLoading } from '../hosts';
import { watchNotifications } from './notifications';

const notify = ({ text, icon }) => ({
  type: 'NOTIFICATION',
  payload: { text, icon },
});

function* initialDataFetch() {
  yield put(startLoading());
  const { data } = yield call(get, '/api/hosts');
  yield put(setHosts(data));
  yield put(stopLoading());
}

function* hostRegistered({ payload }) {
  yield put(appendHost(payload));
  yield put(
    notify({
      text: `A new host, ${payload.hostname}, has been discovered.`,
      icon: '🔥',
    })
  );
}

function* watchHostRegistered() {
  yield takeEvery('HOST_REGISTERED', hostRegistered);
}

export default function* rootSaga() {
  yield all([initialDataFetch(), watchHostRegistered(), watchNotifications()]);
}
