import { get, noop } from 'lodash';

import { requestHostOperation } from '@lib/api/operations';

export const HOST_OPERATION = 'host';

export const SAPTUNE_SOLUTION_APPLY = 'saptune_solution_apply';

const OPERATION_LABELS = {
  [SAPTUNE_SOLUTION_APPLY]: 'Apply Saptune solution',
};

const OPERATION_RESOURCE_TYPES = {
  [SAPTUNE_SOLUTION_APPLY]: HOST_OPERATION,
};

const OPERATION_REQUEST_FUNCS = {
  [HOST_OPERATION]: requestHostOperation,
};

export const getOperationLabel = (operation) =>
  get(OPERATION_LABELS, operation, 'unknown');

export const getOperationResourceType = (operation) =>
  get(OPERATION_RESOURCE_TYPES, operation, 'unknown');

export const getOperationRequestFunc = (resourceType) =>
  get(OPERATION_REQUEST_FUNCS, resourceType, noop);

export const operationSucceeded = (result) =>
  ['UPDATED', 'NOT_UPDATED'].includes(result);
