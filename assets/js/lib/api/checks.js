import { networkClient } from '@lib/network';

// eslint-disable-next-line no-undef
const baseURL = config.checksServiceBaseUrl;

const defaultConfig = { baseURL };

export const getExecutionResult = (executionID) =>
  networkClient.get(`/api/v2/checks/executions/${executionID}`, defaultConfig);

export const getLastExecutionByGroupID = (groupID) =>
  networkClient.get(
    `/api/v2/checks/groups/${groupID}/executions/last`,
    defaultConfig
  );

export const getCatalog = (env) =>
  networkClient.get(`/api/v3/checks/catalog`, {
    ...defaultConfig,
    params: env,
  });

export const getChecksSelection = (groupID, env) =>
  networkClient.get(`/api/v1/checks/groups/${groupID}/catalog`, {
    ...defaultConfig,
    params: env,
  });

export const triggerClusterChecksExecution = (clusterID) =>
  networkClient.post(`/clusters/${clusterID}/checks/request_execution`);

export const triggerHostChecksExecution = (hostID) =>
  networkClient.post(`/hosts/${hostID}/checks/request_execution`);
