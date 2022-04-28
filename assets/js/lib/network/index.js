import axios from 'axios';
import { logError, logWarn } from '@lib/log';

const conf = {
  validateStatus: (status) => {
    return status < 500;
  },
};

export const axiosPost = function (url, data) {
  return axios
    .post(url, data, conf)
    .then(handleResponseStatus)
    .catch((error) => {
      logError(error);
    });
};

export const axiosDelete = function (url) {
  return axios
    .delete(url, conf)
    .then(handleResponseStatus)
    .catch((error) => {
      logError(error);
    });
};

export const axiosPut = function (url, data) {
  return axios
    .put(url, data, conf)
    .then(handleResponseStatus)
    .catch((error) => {
      logError(error);
    });
};

export const axiosGet = function (url) {
  return axios
    .get(url, conf)
    .then(handleResponseStatus)
    .catch((error) => {
      logError(error);
    });
};

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
