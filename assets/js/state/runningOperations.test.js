import { faker } from '@faker-js/faker';

import runningOperationsReducer, {
  removeRunningOperation,
  setRunningOperation,
  setForbiddenOperation,
} from './runningOperations';

describe('runningOperations reducer', () => {
  it('should remove a running operation', () => {
    const groupID = faker.string.uuid();
    const initialState = {
      [groupID]: { operation: faker.lorem.word() },
    };

    const action = removeRunningOperation({ groupID });

    expect(runningOperationsReducer(initialState, action)).toEqual({});
  });

  it('should set running an operation', () => {
    const groupID = faker.string.uuid();
    const operation = faker.lorem.word();
    const initialState = {};
    const expectedState = {
      [groupID]: {
        groupID,
        operation,
        forbidden: false,
        errors: [],
        metadata: {},
      },
    };

    const action = setRunningOperation({ groupID, operation });

    expect(runningOperationsReducer(initialState, action)).toEqual(
      expectedState
    );
  });

  it('should set an operation as forbidden', () => {
    const groupID = faker.string.uuid();
    const operation = faker.lorem.word();
    const errors = ['error1', 'error2'];
    const initialState = {
      [groupID]: { operation, forbidden: false, errors: [] },
    };
    const expectedState = {
      [groupID]: { operation, forbidden: true, errors, metadata: {} },
    };

    const action = setForbiddenOperation({ groupID, operation, errors });

    expect(runningOperationsReducer(initialState, action)).toEqual(
      expectedState
    );
  });
});
