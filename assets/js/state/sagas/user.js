import { call, put, takeEvery } from 'redux-saga/effects';
import {
  setAuthInProgress,
  setAuthError,
  setUser,
  setUserAsLogged,
  USER_DELETED,
  USER_LOCKED,
  USER_UPDATED,
  PERFORM_LOGIN,
} from '@state/user';
import {
  login,
  profile,
  storeAccessToken,
  storeRefreshToken,
  clearCredentialsFromStore,
} from '@lib/auth';
import { networkClient } from '@lib/network';

export function* performLogin({ payload: { username, password } }) {
  yield put(setAuthInProgress());
  try {
    const {
      data: { access_token: accessToken, refresh_token: refreshToken },
    } = yield call(login, { username, password });
    yield call(storeAccessToken, accessToken);
    yield call(storeRefreshToken, refreshToken);
    // Get logged user information
    const {
      id,
      username: profileUsername,
      created_at,
      email,
      fullname,
      updated_at,
      abilities,
    } = yield call(profile, networkClient);
    yield put(
      setUser({
        username: profileUsername,
        id,
        created_at,
        email,
        fullname,
        updated_at,
        abilities,
      })
    );
    yield put(setUserAsLogged());
  } catch (error) {
    yield put(
      setAuthError({ message: error.message, code: error.response?.status })
    );
    yield call(clearCredentialsFromStore);
  }
}

export function* clearUserAndLogout() {
  yield call(clearCredentialsFromStore);
  window.location.href = '/session/new';
}

export function* userUpdated() {
  yield window.location.reload();
}

export function* watchUserActions() {
  yield takeEvery(USER_DELETED, clearUserAndLogout);
  yield takeEvery(USER_LOCKED, clearUserAndLogout);
  yield takeEvery(USER_UPDATED, userUpdated);
  yield takeEvery(PERFORM_LOGIN, performLogin);
}
