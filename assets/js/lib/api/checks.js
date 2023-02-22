import { networkClient } from '@lib/network';

// eslint-disable-next-line no-undef
const baseURL = config.checksServiceBaseUrl;

const defaultConfig = { baseURL };

export const getExecutionResult = (executionID) =>
  networkClient.get(`/api/v1/checks/executions/${executionID}`, defaultConfig);

export const getLastExecutionByGroupID = (groupID) =>
  networkClient.get(
    `/api/v1/checks/groups/${groupID}/executions/last`,
    defaultConfig
  );

export const triggerChecksExecution = (clusterID) =>
  networkClient.post(`/clusters/${clusterID}/checks/request_execution`);

export const getCatalog = (env) =>
  networkClient.get(`/api/v1/checks/catalog`, {
    ...defaultConfig,
    params: env,
  });
