import axios from 'axios';

const baseURL = process.env.WANDA_URL;

export const wandaClient = axios.create({
  baseURL,
});

export const getExecutionResult = (executionID) =>
  wandaClient.get(`/api/checks/executions/${executionID}`);

export const getCatalog = () => wandaClient.get('/api/checks/catalog');
