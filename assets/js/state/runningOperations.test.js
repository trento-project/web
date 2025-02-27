import { faker } from '@faker-js/faker';

import runningOperationsReducer, {
  removeRunningOperation,
  setRunningOperation,
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
      [groupID]: { operation },
    };

    const action = setRunningOperation({ groupID, operation });

    expect(runningOperationsReducer(initialState, action)).toEqual(
      expectedState
    );
  });
});
