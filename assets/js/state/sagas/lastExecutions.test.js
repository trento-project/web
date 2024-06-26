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
  setHostChecksExecutionRequested,
} from '@state/lastExecutions';
import { notify } from '@state/notifications';
import { hostFactory } from '@lib/test-utils/factories';

import {
  updateLastExecution,
  requestExecution,
  requestHostExecution,
} from './lastExecutions';

const axiosMock = new MockAdapter(networkClient);
const lastExecutionURL = (groupID) =>
  `/api/v2/checks/groups/${groupID}/executions/last`;

const triggerClusterChecksExecutionURL = (clusterId) =>
  `/clusters/${clusterId}/checks/request_execution`;

const triggerHostChecksExecutionURL = (hostID) =>
  `/hosts/${hostID}/checks/request_execution`;

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
    const groupID = faker.string.uuid();

    const lastExecution = {
      group_id: groupID,
      critical_count: faker.number.int(),
      warning_count: faker.number.int(),
      passing_count: faker.number.int(),
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
    const groupID = faker.string.uuid();

    axiosMock.onGet(lastExecutionURL(groupID)).reply(404, {});

    const dispatched = await recordSaga(updateLastExecution, {
      payload: { groupID },
    });

    expect(dispatched).toContainEqual(setLastExecutionLoading(groupID));
    expect(dispatched).toContainEqual(setLastExecutionEmpty(groupID));
  });

  it('should update the last execution for a given groupID with an error', async () => {
    const groupID = faker.string.uuid();

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
    const clusterID = faker.string.uuid();
    const clusterName = faker.animal.cat();
    const hosts = [faker.string.uuid(), faker.string.uuid()];
    const checks = [faker.color.human(), faker.color.human()];
    const mockNavigate = jest.fn();
    const router = {
      navigate: mockNavigate,
    };
    const context = { router };

    axiosMock
      .onPost(triggerClusterChecksExecutionURL(clusterID))
      .reply(202, {});

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
      },
      context
    );

    expect(dispatched).toContainEqual(setExecutionRequested(payload));
    expect(dispatched).toContainEqual(
      notify({
        text: `Checks execution requested, cluster: ${clusterName}`,
        icon: '🐰',
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      `/clusters/${clusterID}/executions/last`
    );
  });

  it('should not set the last execution to requested state on failure', async () => {
    const clusterID = faker.string.uuid();
    const clusterName = faker.animal.cat();
    const hosts = [faker.string.uuid(), faker.string.uuid()];
    const checks = [faker.color.human(), faker.color.human()];
    const mockNavigate = jest.fn();
    const router = {
      navigate: mockNavigate,
    };
    const context = { router };

    axiosMock
      .onPost(triggerClusterChecksExecutionURL(clusterID))
      .reply(400, {});

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
      },
      context
    );

    expect(dispatched).not.toContainEqual(setExecutionRequested(payload));
    expect(dispatched).toContainEqual(
      notify({
        text: `Unable to start execution for cluster: ${clusterName}`,
        icon: '❌',
      })
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should set the last host execution to requested state', async () => {
    const host = hostFactory.build();
    const { id: hostID, hostname: hostName } = host;
    const checks = [faker.string.uuid(), faker.string.uuid()];
    const mockNavigate = jest.fn();
    const router = {
      navigate: mockNavigate,
    };
    const context = { router };

    axiosMock.onPost(triggerHostChecksExecutionURL(hostID)).reply(202, {});
    const payload = { checks, host };

    const dispatched = await recordSaga(
      requestHostExecution,
      {
        payload,
      },
      {},
      context
    );
    expect(dispatched).toContainEqual(setHostChecksExecutionRequested(payload));
    expect(dispatched).toContainEqual(
      notify({
        text: `Checks execution requested, host: ${hostName}`,
        icon: '🐰',
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      `/hosts/${hostID}/executions/last`
    );
  });

  it('should not set the host last execution to requested state on failure', async () => {
    const host = hostFactory.build();
    const { id: hostID, hostname: hostName } = host;
    const checks = [faker.string.uuid(), faker.string.uuid()];
    const mockNavigate = jest.fn();
    const router = {
      navigate: mockNavigate,
    };
    const context = { router };

    axiosMock.onPost(triggerHostChecksExecutionURL(hostID)).reply(400, {});

    const payload = { checks, host };
    const dispatched = await recordSaga(
      requestHostExecution,
      {
        payload,
      },
      {},
      context
    );
    expect(dispatched).not.toContainEqual(
      setHostChecksExecutionRequested(payload)
    );
    expect(dispatched).toContainEqual(
      notify({
        text: `Unable to start execution for host: ${hostName}`,
        icon: '❌',
      })
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
