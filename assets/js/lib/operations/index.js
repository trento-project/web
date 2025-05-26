import { get, noop } from 'lodash';

import {
  requestHostOperation,
  requestClusterOperation,
} from '@lib/api/operations';

import { SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG } from './ForbiddenMessages';

export const HOST_OPERATION = 'host';
export const CLUSTER_OPERATION = 'cluster';

export const SAPTUNE_SOLUTION_APPLY = 'saptune_solution_apply';
export const SAPTUNE_SOLUTION_CHANGE = 'saptune_solution_change';
export const CLUSTER_MAINTENANCE_CHANGE = 'cluster_maintenance_change';

const OPERATION_LABELS = {
  [SAPTUNE_SOLUTION_APPLY]: 'Apply Saptune solution',
  [SAPTUNE_SOLUTION_CHANGE]: 'Change Saptune solution',
  [CLUSTER_MAINTENANCE_CHANGE]: 'Cluster maintenance change',
};

const OPERATION_INTERNAL_NAMES = {
  'saptuneapplysolution@v1': SAPTUNE_SOLUTION_APPLY,
  'saptunechangesolution@v1': SAPTUNE_SOLUTION_CHANGE,
  'clustermaintenancechange@v1': CLUSTER_MAINTENANCE_CHANGE,
};

const OPERATION_RESOURCE_TYPES = {
  [SAPTUNE_SOLUTION_APPLY]: HOST_OPERATION,
  [SAPTUNE_SOLUTION_CHANGE]: HOST_OPERATION,
  [CLUSTER_MAINTENANCE_CHANGE]: CLUSTER_OPERATION,
};

const OPERATION_REQUEST_FUNCS = {
  [HOST_OPERATION]: requestHostOperation,
  [CLUSTER_OPERATION]: requestClusterOperation,
};

const OPERATION_FORBIDDEN_MESSAGES = {
  [SAPTUNE_SOLUTION_APPLY]: SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG,
  [SAPTUNE_SOLUTION_CHANGE]: SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG,
};

export const getOperationLabel = (operation) =>
  get(OPERATION_LABELS, operation, 'unknown');

export const getOperationInternalName = (operation) =>
  get(OPERATION_INTERNAL_NAMES, operation, 'unknown');

export const getOperationResourceType = (operation) =>
  get(OPERATION_RESOURCE_TYPES, operation, 'unknown');

export const getOperationRequestFunc = (resourceType) =>
  get(OPERATION_REQUEST_FUNCS, resourceType, noop);

export const getOperationForbiddenMessage = (operation) =>
  get(OPERATION_FORBIDDEN_MESSAGES, operation, null);

export const operationSucceeded = (result) =>
  ['UPDATED', 'NOT_UPDATED'].includes(result);

export const operationRunning = ({ status }) => status === 'running';
