import { call, put, takeEvery, select } from 'redux-saga/effects';
import {
  setAuthInProgress,
  setAuthError,
  setUser,
  setUserAsLogged,
  USER_DELETED,
  USER_LOCKED,
  USER_UPDATED,
  PERFORM_LOGIN,
  PERFORM_SSO_ENROLLMENT,
  PERFORM_SAML_ENROLLMENT,
  USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID,
} from '@state/user';
import { customNotify } from '@state/notifications';
import { getUserProfile } from '@state/selectors/user';
import {
  login,
  ssoEnrollment,
  samlEnrollment,
  profile,
  storeAccessToken,
  storeRefreshToken,
  clearCredentialsFromStore,
} from '@lib/auth';
import { networkClient } from '@lib/network';
import { isSingleSignOnEnabled } from '@lib/auth/config';
import { identify, optinCapturing, reset } from '@lib/analytics';

export function* performLogin({ payload: { username, password, totpCode } }) {
  yield put(setAuthInProgress());
  try {
    const {
      data: { access_token: accessToken, refresh_token: refreshToken },
    } = yield call(login, { username, password, totp_code: totpCode });
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
      password_change_requested,
      analytics_enabled,
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
        password_change_requested,
        analytics_enabled,
      })
    );
    yield call(identify, analytics_enabled, id);
    yield call(optinCapturing, analytics_enabled);
    yield put(setUserAsLogged());
  } catch (error) {
    yield put(
      setAuthError({ message: error.message, code: error.response?.status })
    );
    yield call(clearCredentialsFromStore);
  }
}

function* completeSSOEnrollment(enrollmentFunc, payload) {
  yield put(setAuthInProgress());
  try {
    const {
      data: { access_token: accessToken, refresh_token: refreshToken },
    } = yield call(enrollmentFunc, payload);
    yield call(storeAccessToken, accessToken);
    yield call(storeRefreshToken, refreshToken);

    const {
      id,
      username: profileUsername,
      email,
      fullname,
      abilities,
    } = yield call(profile, networkClient);
    yield put(
      setUser({
        username: profileUsername,
        id,
        email,
        fullname,
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

export function* performSSOEnrollment({ payload: { code, state } }) {
  yield call(completeSSOEnrollment, ssoEnrollment, {
    code,
    session_state: state,
  });
}

export function* performSAMLEnrollment() {
  yield call(completeSSOEnrollment, samlEnrollment, {});
}

export function* clearUserAndLogout() {
  yield call(reset);
  yield call(clearCredentialsFromStore);
  window.location.href = '/session/new';
}

export function* userUpdated() {
  yield window.location.reload();
}

export function* checkUserPasswordChangeRequested() {
  if (isSingleSignOnEnabled()) {
    return;
  }

  const { password_change_requested } = yield select(getUserProfile);

  if (!password_change_requested) {
    return;
  }

  yield put(
    customNotify({
      duration: Infinity,
      id: USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID,
      icon: 'warning',
      isHealthIcon: true,
    })
  );
}

export function* watchUserActions() {
  yield takeEvery(USER_DELETED, clearUserAndLogout);
  yield takeEvery(USER_LOCKED, clearUserAndLogout);
  yield takeEvery(USER_UPDATED, userUpdated);
  yield takeEvery(PERFORM_LOGIN, performLogin);
  yield takeEvery(PERFORM_SSO_ENROLLMENT, performSSOEnrollment);
  yield takeEvery(PERFORM_SAML_ENROLLMENT, performSAMLEnrollment);
}
