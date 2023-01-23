import axios from 'axios';
import { networkClient } from '@lib/network'

const baseURL = process.env.WANDA_URL;

export const getExecutionResult = (executionID) =>
  networkClient.get(`/api/checks/executions/${executionID}`, { baseURL: baseURL });

export const getLastExecutionByGroupID = (groupID) =>
  networkClient.get(`/api/checks/groups/${groupID}/executions/last`, { baseURL: baseURL });

export const getCatalog = (env) =>
  networkClient.get(`/api/checks/catalog`, { baseURL: baseURL, params: env });
