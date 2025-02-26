import { post } from '@lib/network';

export const requestHostOperation = (hostID, operation, params) =>
  post(`/hosts/${hostID}/operations/${operation}`, params);
