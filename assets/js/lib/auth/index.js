import axios from 'axios';
import { getFromConfig } from '@lib/config';

const STORAGE_ACCESS_TOKEN_IDENTIFIER = 'access_token';
const STORAGE_REFRESH_TOKEN_IDENTIFIER = 'refresh_token';

export const authClient = axios.create();

const ensureSuccessfulResponse = (response) => {
  if (response.status !== 200) {
    throw Error('unauthorized', { cause: response.status });
  }
  return response;
};

export const login = (credentials) =>
  authClient.post('/api/session', credentials).then(ensureSuccessfulResponse);

export const ssoEnrollment = (credentials) =>
  authClient
    .post(getFromConfig('ssoEnrollmentUrl'), credentials)
    .then(ensureSuccessfulResponse);

export const samlEnrollment = () =>
  authClient
    .get(getFromConfig('ssoEnrollmentUrl'))
    .then(ensureSuccessfulResponse);

export const refreshAccessToken = (refreshToken) =>
  authClient
    .post('/api/session/refresh', { refresh_token: refreshToken })
    .then(ensureSuccessfulResponse);

export const profile = (apiClient = authClient) =>
  apiClient
    .get('/api/v1/profile', { baseURL: '' })
    .then(ensureSuccessfulResponse)
    .then((response) => response.data);

const storeToken = (storageKey, token) => {
  window.sessionStorage.setItem(storageKey, token);
  window.localStorage.removeItem(storageKey);
};

const getTokenFromStore = (storageKey) => {
  const sessionToken = window.sessionStorage.getItem(storageKey);
  if (sessionToken) return sessionToken;

  const legacyToken = window.localStorage.getItem(storageKey);
  if (legacyToken) {
    window.sessionStorage.setItem(storageKey, legacyToken);
    window.localStorage.removeItem(storageKey);
  }

  return legacyToken;
};

export const storeAccessToken = (accessToken) => {
  storeToken(STORAGE_ACCESS_TOKEN_IDENTIFIER, accessToken);
};

export const storeRefreshToken = (refreshToken) => {
  storeToken(STORAGE_REFRESH_TOKEN_IDENTIFIER, refreshToken);
};

export const getAccessTokenFromStore = () =>
  getTokenFromStore(STORAGE_ACCESS_TOKEN_IDENTIFIER);

export const getRefreshTokenFromStore = () =>
  getTokenFromStore(STORAGE_REFRESH_TOKEN_IDENTIFIER);

export const clearCredentialsFromStore = () => {
  window.sessionStorage.removeItem(STORAGE_ACCESS_TOKEN_IDENTIFIER);
  window.sessionStorage.removeItem(STORAGE_REFRESH_TOKEN_IDENTIFIER);
  window.localStorage.removeItem(STORAGE_ACCESS_TOKEN_IDENTIFIER);
  window.localStorage.removeItem(STORAGE_REFRESH_TOKEN_IDENTIFIER);
};
