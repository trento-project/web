import axios from 'axios';

const baseURL = process.env.WANDA_URL;

export const wandaClient = axios.create({
  baseURL,
});

export const getExecutionResult = (executionID) =>
  wandaClient.get(`/api/checks/executions/${executionID}`);

export const getLastExecutionByGroupID = (groupID) =>
  wandaClient.get(`/api/checks/groups/${groupID}/executions/last`);

export const getCatalog = (env) =>
  wandaClient.get(`/api/checks/catalog`, { params: env });
