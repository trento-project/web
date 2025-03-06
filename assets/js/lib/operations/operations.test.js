import { noop } from 'lodash';

import { requestHostOperation } from '@lib/api/operations';

import {
  getOperationLabel,
  getOperationInternalName,
  getOperationResourceType,
  getOperationRequestFunc,
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
  ])(
    `should return the operation $operation resource type`,
    ({ operation, resourceType }) => {
      expect(getOperationResourceType(operation)).toBe(resourceType);
    }
  );

  it.each([
    {
      operation: 'unknown',
      func: noop,
    },
    {
      operation: 'host',
      func: requestHostOperation,
    },
  ])(
    `should return the operation $operation request function`,
    ({ operation, func }) => {
      expect(getOperationRequestFunc(operation)).toBe(func);
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
