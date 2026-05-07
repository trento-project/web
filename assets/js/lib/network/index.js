// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import axios from 'axios';
import createAuthRefresh from 'axios-auth-refresh';
import { logError, logWarn } from '@lib/log';
import {
  getAccessTokenFromStore,
  getRefreshTokenFromStore,
  refreshAccessToken,
  storeAccessToken,
} from '@lib/auth';

let windowReference = window;

export const withWindowReference = (newWindowReference) => {
  windowReference = newWindowReference;

  return windowReference;
};

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
    // need the params reassign, the library works that way

    failedRequest.response.config.headers.Authorization = `Bearer ${accessToken}`;
  } catch (e) {
    logWarn('could not refresh the token, error during the request flow', e);
    throw unrecoverableAuthError;
  }
};

// Even though it looks counter intuitive, we need to add `deduplicateRefresh: false`
// to enable the retry of all the requests that got 401 at the same time.
// The functionality of this flag is not properly implemented and it doesn't do what
// it should. However, setting it to false fixes our problem.
// Without this change, only the first request with 401 response is retried.
// What the library docs explain about this field doesn't apply if the requests
// receive 401 almost at the same time, as the retry is not handled in that case.
// In any case, the refresh flow is done once
createAuthRefresh(networkClient, refreshAuthLogic, {
  deduplicateRefresh: false,
});

networkClient.interceptors.response.use(null, (error) => {
  if (error === unrecoverableAuthError) {
    logWarn('unrecoverable auth flow, session expired');
    const currentLocationPath = new URLSearchParams();
    currentLocationPath.append(
      'request_path',
      windowReference.location.pathname
    );

    windowReference.location.assign(
      `/session/new?${currentLocationPath.toString()}`
    );
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

export const patch = function patch(url, data, config = null) {
  return networkClient
    .patch(url, data, config)
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
