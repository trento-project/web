// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { createClient } from '@lib/network/http-client';
import { logError, logWarn } from '@lib/log';
import { getAccessTokenFromStore, refreshAndStoreAccessToken } from '@lib/auth';

let windowReference = window;

export const withWindowReference = (newWindowReference) => {
  windowReference = newWindowReference;

  return windowReference;
};

export const unrecoverableAuthError = Error(
  'could not authenticate the user, session destroyed'
);

// Holds the refresh currently being performed, so that requests failing with
// 401 at the same time share a single token exchange.
let inflightRefresh = null;

// Refresh logic: called when networkClient receives a 401.  Exchanges the
// stored refresh token for a new access token, then updates the request
// config with the new Bearer token so the retried request carries it.
//
// A page typically has several requests in flight (the settings page alone
// fires four), so they all get a 401 together: the first one starts the
// exchange and the others await the same promise.  A request that already
// carries an outdated token compared to the store skips the exchange
// altogether and just retries with the token another request obtained.
const refreshAuthLogic = async (config) => {
  try {
    await refreshAndStoreAccessToken();
  } catch (e) {
    logWarn('could not refresh the token, error during the request flow', e);
    throw unrecoverableAuthError;
  }

  config.headers.Authorization = `Bearer ${getAccessTokenFromStore()}`;
  return config;
};

export const networkClient = createClient({
  baseURL: '/api/v1',
  refreshAuthLogic,
});

networkClient.interceptors.request.use((request) => {
  request.headers.Authorization = `Bearer ${getAccessTokenFromStore()}`;
  return request;
});

export const handleUnrecoverableAuthError = () => {
  logWarn('unrecoverable auth flow, session expired');
  const currentLocationPath = new URLSearchParams();
  currentLocationPath.append('request_path', windowReference.location.pathname);
  windowReference.location.assign(
    `/session/new?${currentLocationPath.toString()}`
  );
};

networkClient.interceptors.response.use(null, (error) => {
  if (error === unrecoverableAuthError) {
    handleUnrecoverableAuthError();
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
