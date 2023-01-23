import { faker } from '@faker-js/faker';

import lastExecutionsReducer, {
  setExecutionRequested,
  setLastExecutionLoading,
  setLastExecutionEmpty,
  setLastExecutionError,
  setLastExecution,
  setExecutionStarted,
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
    const action = setLastExecutionError({ groupID: 'someID', error });

    const expectedState = {
      someID: {
        data: null,
        loading: false,
        error,
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
        data,
        loading: false,
        error: null,
      },
    };

    expect(lastExecutionsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should set the executed checks and set off loading', () => {
    const initialState = {
      someID: {
        loading: true,
      },
    };

    const checks = ['check1', 'check2', 'check3'];

    const executionRequestedData = {
      clusterID: 'someID',
      hosts: ['agent1', 'agent2'],
      checks,
    };

    const executionRequestedState = lastExecutionsReducer(
      initialState,
      setExecutionRequested(executionRequestedData)
    );

    const executionStartedData = {
      groupID: 'someID',
      executionID: 'execid',
      checks: ['check1', 'check2'],
    };

    const executionStartedState = lastExecutionsReducer(
      executionRequestedState,
      setExecutionStarted(executionStartedData)
    );

    const expectedState = {
      someID: {
        data: {
          status: 'running',
          targets: [
            { agent_id: 'agent1', checks: ['check1', 'check2'] },
            { agent_id: 'agent2', checks: ['check1', 'check2'] },
          ],
        },
        loading: false,
        error: null,
      },
    };

    expect(expectedState).toEqual(executionStartedState);
  });

  it('should set on a execution requested state a given groupID', () => {
    const initialState = {};

    const checks = ['check1', 'check2'];

    const data = {
      clusterID: 'someID',
      hosts: ['agent1', 'agent2'],
      checks,
    };

    const action = setExecutionRequested(data);

    const expectedState = {
      someID: {
        data: {
          status: 'running',
          targets: [
            { agent_id: 'agent1', checks },
            { agent_id: 'agent2', checks },
          ],
        },
        loading: false,
        error: null,
      },
    };

    expect(lastExecutionsReducer(initialState, action)).toEqual(expectedState);
  });
});
