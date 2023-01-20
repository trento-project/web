import { networkClient } from '@lib/network';

const baseURL = process.env.WANDA_URL;

export const getExecutionResult = (executionID) =>
  networkClient.get(`/api/checks/executions/${executionID}`, { baseURL });

export const getLastExecutionByGroupID = (groupID) =>
  networkClient.get(`/api/checks/groups/${groupID}/executions/last`, {
    baseURL,
  });

export const getCatalog = (env) =>
  networkClient.get(`/api/checks/catalog`, { params: env, baseURL });
