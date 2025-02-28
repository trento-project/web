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
  networkClient.get(`/api/v1/groups/${groupID}/checks`, {
    ...defaultConfig,
    params: env,
  });

export const saveCheckCustomization = ({ checkID, groupID, customValues }) =>
  networkClient.post(
    `/api/v1/groups/${groupID}/checks/${checkID}/customization`,
    { values: customValues },
    defaultConfig
  );

export const resetCheckCustomization = (groupID, checkID) =>
  networkClient.delete(
    `/api/v1/groups/${groupID}/checks/${checkID}/customization`,
    defaultConfig
  );

export const triggerClusterChecksExecution = (clusterID) =>
  networkClient.post(`/clusters/${clusterID}/checks/request_execution`);

export const triggerHostChecksExecution = (hostID) =>
  networkClient.post(`/hosts/${hostID}/checks/request_execution`);
