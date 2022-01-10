import { get } from 'axios';
import { put, all, call, takeEvery } from 'redux-saga/effects';

import { appendHost, setHosts, startLoading, stopLoading, setHeartbeatPassing, setHeartbeatCritical }
  from '../hosts';
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
      icon: '🖖',
    })
  );
}

function* watchHostRegistered() {
  yield takeEvery('HOST_REGISTERED', hostRegistered);
}

function* heartbeatSucceded({ payload }) {
  yield put(setHeartbeatPassing(payload));
  yield put(
    notify({
      text: `The host ${payload.hostname} heartbeat is alive.`,
      icon: '❤️',
    })
  );
}

function* watchHeartbeatSucceded() {
  yield takeEvery('HEARTBEAT_SUCCEDED', heartbeatSucceded);
}

function* heartbeatFailed({ payload }) {
  yield put(setHeartbeatCritical(payload));
  yield put(
    notify({
      text: `The host ${payload.hostname} heartbeat is failing.`,
      icon: '💔',
    })
  );
}

function* watchHeartbeatFailed() {
  yield takeEvery('HEARTBEAT_FAILED', heartbeatFailed);
}

export default function* rootSaga() {
  yield all([initialDataFetch(), watchHostRegistered(), watchHeartbeatSucceded(), watchHeartbeatFailed(), watchNotifications()]);
}
