import { SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG } from './ForbiddenMessages';

import {
  getOperationLabel,
  getOperationInternalName,
  getOperationResourceType,
  getOperationForbiddenMessage,
  operationSucceeded,
  operationRunning,
} from '.';

describe('operations', () => {
  it.each([
    {
      operation: 'unknown',
      label: 'unknown',
    },
    {
      operation: 'saptune_solution_apply',
      label: 'Apply Saptune solution',
    },
    {
      operation: 'saptune_solution_change',
      label: 'Change Saptune solution',
    },
    {
      operation: 'cluster_maintenance_change',
      label: 'Cluster maintenance change',
    },
    {
      operation: 'sap_instance_start',
      label: 'SAP instance start',
    },
    {
      operation: 'sap_instance_stop',
      label: 'SAP instance stop',
    },
    {
      operation: 'pacemaker_enable',
      label: 'Enable Pacemaker',
    },
    {
      operation: 'pacemaker_disable',
      label: 'Disable Pacemaker',
    },
  ])(`should return the operation $operation label`, ({ operation, label }) => {
    expect(getOperationLabel(operation)).toBe(label);
  });

  it.each([
    {
      operation: 'unknown',
      name: 'unknown',
    },
    {
      operation: 'saptuneapplysolution@v1',
      name: 'saptune_solution_apply',
    },
    {
      operation: 'saptunechangesolution@v1',
      name: 'saptune_solution_change',
    },
    {
      operation: 'clustermaintenancechange@v1',
      name: 'cluster_maintenance_change',
    },
    {
      operation: 'sapinstancestart@v1',
      name: 'sap_instance_start',
    },
    {
      operation: 'sapinstancestop@v1',
      name: 'sap_instance_stop',
    },
    {
      operation: 'pacemakerenable@v1',
      name: 'pacemaker_enable',
    },
    {
      operation: 'pacemakerdisable@v1',
      name: 'pacemaker_disable',
    },
  ])(
    `should return the operation $operation internal name`,
    ({ operation, name }) => {
      expect(getOperationInternalName(operation)).toBe(name);
    }
  );

  it.each([
    {
      operation: 'unknown',
      resourceType: 'unknown',
    },
    {
      operation: 'saptune_solution_apply',
      resourceType: 'host',
    },
    {
      operation: 'saptune_solution_change',
      resourceType: 'host',
    },
    {
      operation: 'cluster_maintenance_change',
      resourceType: 'cluster',
    },
    {
      operation: 'sap_instance_start',
      resourceType: 'application_instance',
    },
    {
      operation: 'sap_instance_stop',
      resourceType: 'application_instance',
    },
  ])(
    `should return the operation $operation resource type`,
    ({ operation, resourceType }) => {
      expect(getOperationResourceType(operation)).toBe(resourceType);
    }
  );

  it.each([
    {
      operation: 'unknown',
      message: null,
    },
    {
      operation: 'saptune_solution_apply',
      message: SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG,
    },
    {
      operation: 'saptune_solution_change',
      message: SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG,
    },
  ])(
    `should return the operation $operation forbidden message`,
    ({ operation, message }) => {
      expect(getOperationForbiddenMessage(operation)).toBe(message);
    }
  );

  it('should check if an operation succeeded', () => {
    expect(operationSucceeded('UPDATED')).toBeTruthy();
    expect(operationSucceeded('NOT_UPDATED')).toBeTruthy();
    expect(operationSucceeded('FAILED')).toBeFalsy();
  });

  it('should check if an operation is running', () => {
    expect(operationRunning({ status: 'running' })).toBeTruthy();
    expect(operationRunning({ status: 'completed' })).toBeFalsy();
  });
});
