import { getLastExecution } from './lastExecutions';

describe('lastExecutions selector', () => {
  it('should return the expected last execution by group ID', () => {
    const state = {
      lastExecutions: {
        someID: {
          loading: false,
          data: {},
          error: null,
        },
      },
    };

    const expectedState = {
      loading: false,
      data: {},
      error: null,
    };

    expect(getLastExecution('someID')(state)).toEqual(expectedState);
  });
});
