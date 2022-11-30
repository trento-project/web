import { faker } from '@faker-js/faker';

import lastExecutionsReducer, {
  setLastExecutionLoading,
  setLastExecutionEmpty,
  setLastExecutionError,
  setLastExecution,
} from './lastExecutions';

describe('lastExecutions reducer', () => {
  it('should set the last execution of a given groupID to the loading state', () => {
    const initialState = {
      someID: {
        data: null,
        loading: false,
        error: null,
      },
    };

    const action = setLastExecutionLoading('someID');

    const expectedState = {
      someID: {
        data: null,
        loading: true,
        error: null,
      },
    };

    expect(lastExecutionsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should set the last execution of a given groupID to empty', () => {
    const initialState = {
      someID: {
        data: JSON.parse(faker.datatype.json()),
        loading: false,
        error: null,
      },
    };

    const action = setLastExecutionEmpty('someID');

    const expectedState = {
      someID: {
        data: null,
        loading: false,
        error: null,
      },
    };

    expect(lastExecutionsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should set the last execution of a given groupID to the error state', () => {
    const initialState = {
      someID: {
        data: JSON.parse(faker.datatype.json()),
        loading: true,
        error: null,
      },
    };

    const error = faker.hacker.phrase();
    const action = setLastExecutionError({ groupID: 'someID', error: error });

    const expectedState = {
      someID: {
        data: null,
        loading: false,
        error: error,
      },
    };

    expect(lastExecutionsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should set the last execution of a given groupID', () => {
    const initialState = {};

    const data = {
      group_id: 'someID',
      critical_count: faker.datatype.number(),
      warning_count: faker.datatype.number(),
      passing_count: faker.datatype.number(),
      status: 'completed',
    };

    const action = setLastExecution(data);

    const expectedState = {
      someID: {
        data: data,
        loading: false,
        error: null,
      },
    };

    expect(lastExecutionsReducer(initialState, action)).toEqual(expectedState);
  });
});
