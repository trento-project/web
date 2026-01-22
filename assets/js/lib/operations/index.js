import { get } from 'lodash';

import { SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG } from './ForbiddenMessages';

export const HOST_OPERATION = 'host';
export const CLUSTER_OPERATION = 'cluster';
export const SAP_SYSTEM_OPERATION = 'sap_system';
export const APPLICATION_INSTANCE_OPERATION = 'application_instance';
export const CLUSTER_HOST_OPERATION = 'cluster_host';
export const DATABASE_OPERATION = 'database';

export const SAPTUNE_SOLUTION_APPLY = 'saptune_solution_apply';
export const SAPTUNE_SOLUTION_CHANGE = 'saptune_solution_change';
export const CLUSTER_MAINTENANCE_CHANGE = 'cluster_maintenance_change';
export const CLUSTER_HOST_START = 'cluster_host_start';
export const CLUSTER_HOST_STOP = 'cluster_host_stop';
export const CLUSTER_RESOURCE_REFRESH = 'cluster_resource_refresh';
export const SAP_INSTANCE_START = 'sap_instance_start';
export const SAP_INSTANCE_STOP = 'sap_instance_stop';
export const SAP_SYSTEM_START = 'sap_system_start';
export const SAP_SYSTEM_STOP = 'sap_system_stop';
export const PACEMAKER_ENABLE = 'pacemaker_enable';
export const PACEMAKER_DISABLE = 'pacemaker_disable';
export const DATABASE_START = 'database_start';
export const DATABASE_STOP = 'database_stop';
export const HOST_REBOOT = 'reboot';

const OPERATION_LABELS = {
  [SAPTUNE_SOLUTION_APPLY]: 'Apply Saptune solution',
  [SAPTUNE_SOLUTION_CHANGE]: 'Change Saptune solution',
  [CLUSTER_HOST_START]: 'Start cluster host',
  [CLUSTER_HOST_STOP]: 'Stop cluster host',
  [CLUSTER_MAINTENANCE_CHANGE]: 'Cluster maintenance change',
  [CLUSTER_RESOURCE_REFRESH]: 'Refresh cluster resources',
  [SAP_INSTANCE_START]: 'SAP instance start',
  [SAP_INSTANCE_STOP]: 'SAP instance stop',
  [SAP_SYSTEM_START]: 'SAP system start',
  [SAP_SYSTEM_STOP]: 'SAP system stop',
  [PACEMAKER_ENABLE]: 'Enable Pacemaker',
  [PACEMAKER_DISABLE]: 'Disable Pacemaker',
  [DATABASE_START]: 'Database start',
  [DATABASE_STOP]: 'Database stop',
  [HOST_REBOOT]: 'Reboot host',
};

const OPERATION_TITLES = {
  [CLUSTER_HOST_START]: 'Start cluster host',
  [CLUSTER_HOST_STOP]: 'Stop cluster host',
  [CLUSTER_MAINTENANCE_CHANGE]: 'Maintenance change',
  [CLUSTER_RESOURCE_REFRESH]: 'Refresh resources',
  [DATABASE_START]: 'Start database',
  [DATABASE_STOP]: 'Stop database',
  [HOST_REBOOT]: 'Reboot host',
  [PACEMAKER_DISABLE]: 'Disable Pacemaker',
  [PACEMAKER_ENABLE]: 'Enable Pacemaker',
  [SAP_INSTANCE_START]: 'Start SAP instance',
  [SAP_INSTANCE_STOP]: 'Stop SAP instance',
  [SAP_SYSTEM_START]: 'Start SAP system',
  [SAP_SYSTEM_STOP]: 'Stop SAP system',
  [SAPTUNE_SOLUTION_APPLY]: 'Apply Saptune solution',
  [SAPTUNE_SOLUTION_CHANGE]: 'Change Saptune solution',
};

const OPERATION_INTERNAL_NAMES = {
  'saptuneapplysolution@v1': SAPTUNE_SOLUTION_APPLY,
  'saptunechangesolution@v1': SAPTUNE_SOLUTION_CHANGE,
  'crmclusterstart@v1': CLUSTER_HOST_START,
  'crmclusterstop@v1': CLUSTER_HOST_STOP,
  'clustermaintenancechange@v1': CLUSTER_MAINTENANCE_CHANGE,
  'clusterresourcerefresh@v1': CLUSTER_RESOURCE_REFRESH,
  'sapinstancestart@v1': SAP_INSTANCE_START,
  'sapinstancestop@v1': SAP_INSTANCE_STOP,
  'sapsystemstart@v1': SAP_SYSTEM_START,
  'sapsystemstop@v1': SAP_SYSTEM_STOP,
  'pacemakerenable@v1': PACEMAKER_ENABLE,
  'pacemakerdisable@v1': PACEMAKER_DISABLE,
  'databasestart@v1': DATABASE_START,
  'databasestop@v1': DATABASE_STOP,
  'hostreboot@v1': HOST_REBOOT,
};

const OPERATION_RESOURCE_TYPES = {
  [SAPTUNE_SOLUTION_APPLY]: HOST_OPERATION,
  [SAPTUNE_SOLUTION_CHANGE]: HOST_OPERATION,
  [CLUSTER_HOST_START]: CLUSTER_HOST_OPERATION,
  [CLUSTER_HOST_STOP]: CLUSTER_HOST_OPERATION,
  [CLUSTER_MAINTENANCE_CHANGE]: CLUSTER_OPERATION,
  [CLUSTER_RESOURCE_REFRESH]: CLUSTER_OPERATION,
  [SAP_INSTANCE_START]: APPLICATION_INSTANCE_OPERATION,
  [SAP_INSTANCE_STOP]: APPLICATION_INSTANCE_OPERATION,
  [SAP_SYSTEM_START]: SAP_SYSTEM_OPERATION,
  [SAP_SYSTEM_STOP]: SAP_SYSTEM_OPERATION,
  [PACEMAKER_ENABLE]: CLUSTER_HOST_OPERATION,
  [PACEMAKER_DISABLE]: CLUSTER_HOST_OPERATION,
  [DATABASE_START]: DATABASE_OPERATION,
  [DATABASE_STOP]: DATABASE_OPERATION,
  [HOST_REBOOT]: HOST_OPERATION,
};

const OPERATION_FORBIDDEN_MESSAGES = {
  [SAPTUNE_SOLUTION_APPLY]: SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG,
  [SAPTUNE_SOLUTION_CHANGE]: SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG,
};

export const getOperationLabel = (operation) =>
  get(OPERATION_LABELS, operation, 'unknown');

export const getOperationTitle = (operation) =>
  get(OPERATION_TITLES, operation, 'unknown operation');

export const getOperationInternalName = (operation) =>
  get(OPERATION_INTERNAL_NAMES, operation, 'unknown');

export const getOperationResourceType = (operation) =>
  get(OPERATION_RESOURCE_TYPES, operation, 'unknown');

export const getOperationForbiddenMessage = (operation) =>
  get(OPERATION_FORBIDDEN_MESSAGES, operation, null);

export const operationSucceeded = (result) =>
  ['UPDATED', 'NOT_UPDATED'].includes(result);
