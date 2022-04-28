import { put, call, takeEvery } from 'redux-saga/effects';
import { axiosPost } from '@lib/network';

import { acceptEula } from '@state/settings';
import { logError } from '@lib/log';

export function* acceptEulaSaga() {
  try {
    yield call(axiosPost, '/api/accept_eula', {});

    yield put(acceptEula());
  } catch (error) {
    logError(error);
  }
}

export function* watchAcceptEula() {
  yield takeEvery('ACCEPT_EULA', acceptEulaSaga);
}
