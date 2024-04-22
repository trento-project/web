import { call, put, takeEvery } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import {
  setAuthInProgress,
  setAuthError,
  setUser,
  setUserAsLogged,
} from '@state/user';
import {
  login,
  me,
  storeAccessToken,
  storeRefreshToken,
  clearCredentialsFromStore,
} from '@lib/auth';
import { networkClient } from '@lib/network';

export const PERFORM_LOGIN = 'PERFORM_LOGIN';
export const performLoginAction = createAction(
  PERFORM_LOGIN,
  ({ username, password }) => ({ payload: { username, password } })
);

export function* performLogin({ payload: { username, password } }) {
  yield put(setAuthInProgress());
  try {
    const {
      data: { access_token: accessToken, refresh_token: refreshToken },
    } = yield call(login, { username, password });
    yield call(storeAccessToken, accessToken);
    yield call(storeRefreshToken, refreshToken);
    // Get logged user information
    const { id, username: profileUsername } = yield call(me, networkClient);
    yield put(setUser({ username: profileUsername, id }));
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
