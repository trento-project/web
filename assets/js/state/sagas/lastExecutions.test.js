import MockAdapter from 'axios-mock-adapter';
import { faker } from '@faker-js/faker';

import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import {
  setLastExecutionLoading,
  setLastExecution,
  setLastExecutionEmpty,
  setLastExecutionError,
} from '@state/lastExecutions';
import { updateLastExecution } from './lastExecutions';

const axiosMock = new MockAdapter(networkClient);
const lastExecutionURL = (groupID) =>
  `/api/v1/checks/groups/${groupID}/executions/last`;

describe('lastExecutions saga', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
  });

  it('should update the last execution for a given groupID', async () => {
    const groupID = faker.datatype.uuid();

    const lastExecution = {
      group_id: groupID,
      critical_count: faker.datatype.number(),
      warning_count: faker.datatype.number(),
      passing_count: faker.datatype.number(),
      status: 'completed',
    };

    axiosMock.onGet(lastExecutionURL(groupID)).reply(200, lastExecution);

    const dispatched = await recordSaga(updateLastExecution, {
      payload: { groupID },
    });

    expect(dispatched).toContainEqual(setLastExecutionLoading(groupID));
    expect(dispatched).toContainEqual(setLastExecution(lastExecution));
  });

  it('should update the last execution for a given groupID to an empty state', async () => {
    const groupID = faker.datatype.uuid();

    axiosMock.onGet(lastExecutionURL(groupID)).reply(404, {});

    const dispatched = await recordSaga(updateLastExecution, {
      payload: { groupID },
    });

    expect(dispatched).toContainEqual(setLastExecutionLoading(groupID));
    expect(dispatched).toContainEqual(setLastExecutionEmpty(groupID));
  });

  it('should the last execution for a given groupID with an error', async () => {
    const groupID = faker.datatype.uuid();

    axiosMock.onGet(lastExecutionURL(groupID)).networkError();

    const dispatched = await recordSaga(updateLastExecution, {
      payload: { groupID },
    });

    expect(dispatched).toContainEqual(setLastExecutionLoading(groupID));
    expect(dispatched).toContainEqual(
      setLastExecutionError({ groupID, error: 'Network Error' })
    );
  });
});
