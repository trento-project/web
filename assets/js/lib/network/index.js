import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { logError, logWarn } from '@lib/log';
import {
  getAccessTokenFromStore,
  getRefreshTokenFromStore,
  refreshAccessToken,
  storeAccessToken,
} from '@lib/auth';

export const unrecoverableAuthError = Error(
  'could not authenticate the user, session destroyed'
);

export const networkClient = axios.create({
  baseURL: '/api/v1',
});

networkClient.interceptors.request.use((request) => {
  request.headers.Authorization = `Bearer ${getAccessTokenFromStore()}`;
  return request;
});

const refreshAuthLogic = async (failedRequest) => {
  const refreshToken = getRefreshTokenFromStore();
  if (!refreshToken) {
    logWarn('could not refresh the access token, refresh token not found');
    throw unrecoverableAuthError;
  }

  try {
    const { data } = await refreshAccessToken(refreshToken);
    const accessToken = data.access_token;
    storeAccessToken(accessToken);
    // need the params reassing, the library works that way
    // eslint-disable-next-line
    failedRequest.response.config.headers.Authorization = `Bearer ${accessToken}`;
  } catch (e) {
    logWarn('could not refresh the token, error during the request flow', e);
    throw unrecoverableAuthError;
  }
};

createAuthRefreshInterceptor(networkClient, refreshAuthLogic);

networkClient.interceptors.response.use(null, (error) => {
  if (error === unrecoverableAuthError) {
    logWarn('unrecoverable auth flow, session expired');
    const currentLocationPath = new URLSearchParams();
    currentLocationPath.append('request_path', window.location.pathname);

    window.location.assign(`/session/new?${currentLocationPath.toString()}`);
  }
  throw error;
});

function handleError(error) {
  if (error === unrecoverableAuthError) return;
  logError(error);
  throw error;
}

function handleResponseStatus(response) {
  if (response.status < 400) {
    return response;
  }
  logError(response.statusText);
  return response;
}

export const post = function post(url, data, config = null) {
  return networkClient
    .post(url, data, config)
    .then(handleResponseStatus)
    .catch((error) => {
      handleError(error);
    });
};

export const del = function del(url, config = null) {
  return networkClient
    .delete(url, config)
    .then(handleResponseStatus)
    .catch((error) => {
      handleError(error);
    });
};

export const put = function put(url, data, config = null) {
  return networkClient
    .put(url, data, config)
    .then(handleResponseStatus)
    .catch((error) => {
      handleError(error);
    });
};

export const get = function get(url, config = null) {
  return networkClient
    .get(url, config)
    .then(handleResponseStatus)
    .catch((error) => {
      handleError(error);
    });
};
