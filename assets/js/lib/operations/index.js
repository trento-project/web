import { get } from 'lodash';

import { SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG } from './ForbiddenMessages';

export const HOST_OPERATION = 'host';
export const CLUSTER_OPERATION = 'cluster';
export const APPLICATION_INSTANCE_OPERATION = 'application_instance';

export const SAPTUNE_SOLUTION_APPLY = 'saptune_solution_apply';
export const SAPTUNE_SOLUTION_CHANGE = 'saptune_solution_change';
export const CLUSTER_MAINTENANCE_CHANGE = 'cluster_maintenance_change';
export const SAP_INSTANCE_START = 'sap_instance_start';
export const SAP_INSTANCE_STOP = 'sap_instance_stop';
export const PACEMAKER_ENABLE = 'pacemaker_enable';
export const PACEMAKER_DISABLE = 'pacemaker_disable';

const OPERATION_LABELS = {
  [SAPTUNE_SOLUTION_APPLY]: 'Apply Saptune solution',
  [SAPTUNE_SOLUTION_CHANGE]: 'Change Saptune solution',
  [CLUSTER_MAINTENANCE_CHANGE]: 'Cluster maintenance change',
  [SAP_INSTANCE_START]: 'SAP instance start',
  [SAP_INSTANCE_STOP]: 'SAP instance stop',
  [PACEMAKER_ENABLE]: 'Enable Pacemaker',
  [PACEMAKER_DISABLE]: 'Disable Pacemaker',
};

const OPERATION_INTERNAL_NAMES = {
  'saptuneapplysolution@v1': SAPTUNE_SOLUTION_APPLY,
  'saptunechangesolution@v1': SAPTUNE_SOLUTION_CHANGE,
  'clustermaintenancechange@v1': CLUSTER_MAINTENANCE_CHANGE,
  'sapinstancestart@v1': SAP_INSTANCE_START,
  'sapinstancestop@v1': SAP_INSTANCE_STOP,
  'pacemakerenable@v1': PACEMAKER_ENABLE,
  'pacemakerdisable@v1': PACEMAKER_DISABLE,
};

const OPERATION_RESOURCE_TYPES = {
  [SAPTUNE_SOLUTION_APPLY]: HOST_OPERATION,
  [SAPTUNE_SOLUTION_CHANGE]: HOST_OPERATION,
  [CLUSTER_MAINTENANCE_CHANGE]: CLUSTER_OPERATION,
  [SAP_INSTANCE_START]: APPLICATION_INSTANCE_OPERATION,
  [SAP_INSTANCE_STOP]: APPLICATION_INSTANCE_OPERATION,
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

export const getOperationForbiddenMessage = (operation) =>
  get(OPERATION_FORBIDDEN_MESSAGES, operation, null);

export const operationSucceeded = (result) =>
  ['UPDATED', 'NOT_UPDATED'].includes(result);

export const operationRunning = ({ status }) => status === 'running';
