import axios from 'axios';
import { logError, logWarn } from '@lib/log';

const conf = {
  validateStatus: (status) => status < 500,
};

function handleError(error) {
  logError(error);
  throw error;
}

function handleResponseStatus(response) {
  if (response.status < 400) {
    return response;
  }
  switch (response.status) {
    case 401:
    case 403:
      logWarn('Redirecting to login after status', response.status);
      window.location.href = '/session/new';
      break;

    default:
      logError(response.statusText);
  }

  return response;
}

export const post = function post(url, data) {
  return axios
    .post(url, data, conf)
    .then(handleResponseStatus)
    .catch((error) => {
      handleError(error);
    });
};

export const del = function del(url) {
  return axios
    .delete(url, conf)
    .then(handleResponseStatus)
    .catch((error) => {
      handleError(error);
    });
};

export const put = function put(url, data) {
  return axios
    .put(url, data, conf)
    .then(handleResponseStatus)
    .catch((error) => {
      handleError(error);
    });
};

export const get = function get(url) {
  return axios
    .get(url, conf)
    .then(handleResponseStatus)
    .catch((error) => {
      handleError(error);
    });
};
