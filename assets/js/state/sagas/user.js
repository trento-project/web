import { put, call, takeEvery } from 'redux-saga/effects';
import {
  setAuthInProgress,
  setAuthError,
  setUser,
  setUserAsLogged,
} from '@state/user';
import {
  login,
  storeAccessToken,
  storeRefreshToken,
  clearCredentialsFromStore,
} from '@lib/auth';
import { PERFORM_LOGIN } from '@state/actions/auth';

export function* performLogin({ payload: { username, password } }) {
  yield put(setAuthInProgress());
  try {
    const {
      data: { access_token: accessToken, refresh_token: refreshToken },
    } = yield call(login, { username, password });
    yield put(setUser({ username }));
    yield call(storeAccessToken, accessToken);
    yield call(storeRefreshToken, refreshToken);
    yield put(setUserAsLogged());
  } catch (error) {
    yield put(
      setAuthError({ message: error.message, code: error.response?.status })
    );
    yield call(clearCredentialsFromStore);
  }
}

export function* watchPerformLogin() {
  yield takeEvery(PERFORM_LOGIN, performLogin);
}
