import MockAdapter from 'axios-mock-adapter';
import { faker } from '@faker-js/faker';

import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import {
  setLastExecutionLoading,
  setLastExecution,
  setLastExecutionEmpty,
  setLastExecutionError,
  setExecutionRequested,
} from '@state/lastExecutions';
import { notify } from '@state/actions/notifications';
import { updateLastExecution, requestExecution } from './lastExecutions';

const axiosMock = new MockAdapter(networkClient);
const lastExecutionURL = (groupID) =>
  `/api/v1/checks/groups/${groupID}/executions/last`;

const triggerChecksExecutionURL = (clusterId) =>
  `/clusters/${clusterId}/checks/request_execution`;

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

  it('should update the last execution for a given groupID with an error', async () => {
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

  it('should set the last execution to requested state', async () => {
    const clusterID = faker.datatype.uuid();
    const clusterName = faker.animal.cat();
    const hosts = [faker.datatype.uuid(), faker.datatype.uuid()];
    const checks = [faker.color.human(), faker.color.human()];

    axiosMock.onPost(triggerChecksExecutionURL(clusterID)).reply(202, {});

    const payload = { clusterID, hosts, checks };
    const dispatched = await recordSaga(
      requestExecution,
      {
        payload,
      },
      {
        clustersList: {
          clusters: [{ id: clusterID, name: clusterName }],
        },
      }
    );

    expect(dispatched).toContainEqual(setExecutionRequested(payload));
    expect(dispatched).toContainEqual(
      notify({
        text: `Checks execution requested, cluster: ${clusterName}`,
        icon: '🐰',
      })
    );
  });

  it('should not set the last execution to requested state on failure', async () => {
    const clusterID = faker.datatype.uuid();
    const clusterName = faker.animal.cat();
    const hosts = [faker.datatype.uuid(), faker.datatype.uuid()];
    const checks = [faker.color.human(), faker.color.human()];

    axiosMock.onPost(triggerChecksExecutionURL(clusterID)).reply(400, {});

    const payload = { clusterID, hosts, checks };
    const dispatched = await recordSaga(
      requestExecution,
      {
        payload,
      },
      {
        clustersList: {
          clusters: [{ id: clusterID, name: clusterName }],
        },
      }
    );

    expect(dispatched).not.toContainEqual(setExecutionRequested(payload));
    expect(dispatched).toContainEqual(
      notify({
        text: `Unable to start execution for cluster: ${clusterName}`,
        icon: '❌',
      })
    );
  });
});
