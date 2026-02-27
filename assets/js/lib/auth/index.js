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
  authClient
    .post('/api/session', credentials)
    .then(ensureSuccessfulResponse);

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

const decodeBase64Url = (value) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
};

export const getAccessTokenSubject = () => {
  const accessToken = getAccessTokenFromStore();
  if (!accessToken) return undefined;

  const parts = accessToken.split('.');
  if (parts.length < 2) return undefined;

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    const sub = payload?.sub;
    if (typeof sub === 'number') return sub;
    if (typeof sub === 'string' && sub.length > 0) {
      const numeric = Number(sub);
      return Number.isNaN(numeric) ? sub : numeric;
    }
    return undefined;
  } catch (_error) {
    return undefined;
  }
};

export const clearCredentialsFromStore = () => {
  window.sessionStorage.removeItem(STORAGE_ACCESS_TOKEN_IDENTIFIER);
  window.sessionStorage.removeItem(STORAGE_REFRESH_TOKEN_IDENTIFIER);
  window.localStorage.removeItem(STORAGE_ACCESS_TOKEN_IDENTIFIER);
  window.localStorage.removeItem(STORAGE_REFRESH_TOKEN_IDENTIFIER);
};
