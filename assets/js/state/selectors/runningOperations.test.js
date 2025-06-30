import { faker } from '@faker-js/faker';

import {
  getRunningOperation,
  getRunningOperationsList,
  isOperationRunning,
} from './runningOperations';

describe('runningOperations selector', () => {
  it('should return the running operation by group ID', () => {
    const groupID = faker.string.uuid();
    const operation = faker.animal.bear();

    const state = {
      runningOperations: {
        [groupID]: {
          groupID,
          operation,
        },
      },
    };

    const expectedState = {
      groupID,
      operation,
    };

    expect(getRunningOperation(groupID)(state)).toEqual(expectedState);
    expect(getRunningOperation(faker.string.uuid())(state)).toEqual(null);
  });

  it('should return the running operations as list', () => {
    const groupID1 = faker.string.uuid();
    const groupID2 = faker.string.uuid();
    const operation1 = faker.animal.bear();
    const operation2 = faker.animal.bird();

    const state = {
      runningOperations: {
        [groupID1]: {
          operation: operation1,
        },
        [groupID2]: {
          operation: operation2,
        },
      },
    };

    const expectedState = [
      { groupID: groupID1, operation: operation1 },
      { groupID: groupID2, operation: operation2 },
    ];

    expect(getRunningOperationsList(state)).toEqual(expectedState);
  });

  it('should check if operation is running', () => {
    const groupID1 = faker.string.uuid();
    const groupID2 = faker.string.uuid();
    const operation1 = faker.animal.bear();
    const operation2 = faker.animal.bird();

    const runningOperation1 = { groupID: groupID1, operation: operation1 };
    const runningOperation2 = { groupID: groupID2, operation: operation2 };

    const runningOperations = [runningOperation1, runningOperation2];

    expect(
      isOperationRunning(runningOperations, groupID1, operation1)
    ).toBeTruthy();
    expect(
      isOperationRunning(runningOperations, groupID2, operation1)
    ).toBeFalsy();
    expect(
      isOperationRunning(runningOperations, groupID1, operation2)
    ).toBeFalsy();
  });

  it('should check if operation is running by using a custom matcher', () => {
    const groupID = faker.string.uuid();
    const operation = faker.animal.bear();

    const runningOperations1 = [
      { groupID, operation, metadata: { foo: 'bar' } },
    ];

    const runningOperations2 = [
      { groupID, operation, metadata: { foo: 'baz' } },
    ];

    const matcher = ({ metadata }) => metadata.foo === 'bar';

    expect(
      isOperationRunning(runningOperations1, groupID, operation, matcher)
    ).toBeTruthy();
    expect(
      isOperationRunning(runningOperations2, groupID, operation, matcher)
    ).toBeFalsy();
  });
});
