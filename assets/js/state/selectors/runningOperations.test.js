import { faker } from '@faker-js/faker';

import { getRunningOperation } from './runningOperations';

describe('runningOperations selector', () => {
  it('should return the running operation by group ID', () => {
    const groupID = faker.string.uuid();
    const operation = faker.animal.bear();

    const state = {
      runningOperations: {
        [groupID]: {
          operation,
        },
      },
    };

    const expectedState = {
      operation,
    };

    expect(getRunningOperation(groupID)(state)).toEqual(expectedState);
    expect(getRunningOperation(faker.string.uuid())(state)).toEqual({});
  });
});
