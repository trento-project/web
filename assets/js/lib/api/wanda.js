import { networkClient } from '@lib/network';

const baseURL = process.env.WANDA_URL;
const defaultConfig = { baseURL };

export const getExecutionResult = (executionID) =>
  networkClient.get(`/api/checks/executions/${executionID}`, defaultConfig);

export const getLastExecutionByGroupID = (groupID) =>
  networkClient.get(
    `/api/checks/groups/${groupID}/executions/last`,
    defaultConfig
  );

export const getCatalog = (env) =>
  networkClient.get(`/api/checks/catalog`, { ...defaultConfig, params: env });
