import { networkClient, post } from '@lib/network';

// eslint-disable-next-line no-undef
const baseURL = config.checksServiceBaseUrl;

const defaultConfig = { baseURL };

export const requestHostOperation = (hostID, operation, params) =>
  post(`/hosts/${hostID}/operations/${operation}`, params);

export const requestClusterOperation = (clusterID, operation, params) =>
  post(`/clusters/${clusterID}/operations/${operation}`, params);

export const requestSapInstanceOperation = (
  sapSystemID,
  hostID,
  instanceNumber,
  operation,
  params
) =>
  post(
    `/sap_systems/${sapSystemID}/hosts/${hostID}/instances/${instanceNumber}/operations/${operation}`,
    params
  );

export const getOperationExecutions = (params) =>
  networkClient.get('/api/v1/operations/executions', {
    ...defaultConfig,
    params,
  });
