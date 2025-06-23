import { SAPTUNE_SOLUTION_OPERATION_FORBIDDEN_MSG } from './ForbiddenMessages';

import {
  getOperationLabel,
  getOperationInternalName,
  getOperationResourceType,
  getOperationForbiddenMessage,
  operationSucceeded,
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
      resourceType: 'sap_instance',
    },
    {
      operation: 'sap_instance_stop',
      resourceType: 'sap_instance',
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
});
