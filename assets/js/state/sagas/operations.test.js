import MockAdapter from 'axios-mock-adapter';
import { faker } from '@faker-js/faker';

import { recordSaga } from '@lib/test-utils';
import { networkClient } from '@lib/network';

import {
  SAPTUNE_SOLUTION_APPLY,
  CLUSTER_MAINTENANCE_CHANGE,
  getOperationLabel,
} from '@lib/operations';
import {
  removeRunningOperation,
  setRunningOperation,
  setForbiddenOperation,
} from '@state/runningOperations';
import { notify } from '@state/notifications';

import {
  requestOperation,
  completeOperation,
  updateRunningOperation,
} from './operations';

const axiosMock = new MockAdapter(networkClient);
const hostOperationRequestURL = (hostID, operation) =>
  `/hosts/${hostID}/operations/${operation}`;

const clusterOperationRequestURL = (clusterID, operation) =>
  `/clusters/${clusterID}/operations/${operation}`;

const getOperationExecutionsURL = () => `/api/v1/operations/executions`;

const KNOWN_OPERATION = SAPTUNE_SOLUTION_APPLY;
const KNOWN_OPERATION_LABEL = getOperationLabel(SAPTUNE_SOLUTION_APPLY);

describe('operations saga', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
  });

  describe('request operation', () => {
    it('should request a host operation', async () => {
      const groupID = faker.string.uuid();
      const operation = KNOWN_OPERATION;
      const hostname = faker.internet.displayName();

      axiosMock
        .onPost(hostOperationRequestURL(groupID, operation))
        .reply(202, {});

      const dispatched = await recordSaga(
        requestOperation,
        {
          payload: { groupID, operation },
        },
        { hostsList: { hosts: [{ id: groupID, hostname }] } }
      );

      expect(dispatched).toEqual([
        setRunningOperation({ groupID, operation }),
        notify({
          text: `Operation ${KNOWN_OPERATION_LABEL} requested for ${hostname}`,
          icon: '⚙️',
        }),
      ]);
    });

    it('should request a cluster operation', async () => {
      const groupID = faker.string.uuid();
      const operation = CLUSTER_MAINTENANCE_CHANGE;
      const name = faker.internet.displayName();
      const label = getOperationLabel(operation);

      axiosMock
        .onPost(clusterOperationRequestURL(groupID, operation))
        .reply(202, {});

      const dispatched = await recordSaga(
        requestOperation,
        {
          payload: { groupID, operation },
        },
        { clustersList: { clusters: [{ id: groupID, name }] } }
      );

      expect(dispatched).toEqual([
        setRunningOperation({ groupID, operation }),
        notify({
          text: `Operation ${label} requested for ${name}`,
          icon: '⚙️',
        }),
      ]);
    });

    it('should fail requesting an operation if the api request fails', async () => {
      const groupID = faker.string.uuid();
      const operation = KNOWN_OPERATION;
      const hostname = faker.internet.displayName();

      axiosMock
        .onPost(hostOperationRequestURL(groupID, operation))
        .reply(404, {});

      const dispatched = await recordSaga(
        requestOperation,
        {
          payload: { groupID, operation },
        },
        { hostsList: { hosts: [{ id: groupID, hostname }] } }
      );

      expect(dispatched).toEqual([
        setRunningOperation({ groupID, operation }),
        removeRunningOperation({ groupID }),
        notify({
          text: `Operation ${KNOWN_OPERATION_LABEL} request for ${hostname} failed`,
          icon: '❌',
        }),
      ]);
    });

    it('should fail requesting an operation if the api request is forbidden', async () => {
      const groupID = faker.string.uuid();
      const operation = KNOWN_OPERATION;
      const hostname = faker.internet.displayName();

      axiosMock
        .onPost(hostOperationRequestURL(groupID, operation))
        .reply(403, { errors: [{ detail: 'error1' }, { detail: 'error2' }] });

      const dispatched = await recordSaga(
        requestOperation,
        {
          payload: { groupID, operation },
        },
        { hostsList: { hosts: [{ id: groupID, hostname }] } }
      );

      expect(dispatched).toEqual([
        setRunningOperation({ groupID, operation }),
        setForbiddenOperation({
          groupID,
          operation,
          errors: ['error1', 'error2'],
        }),
      ]);
    });
  });

  describe('complete operation', () => {
    it('should complete successfully a host operation', async () => {
      const groupID = faker.string.uuid();
      const operation = KNOWN_OPERATION;
      const hostname = faker.internet.displayName();

      const dispatched = await recordSaga(
        completeOperation,
        {
          payload: { groupID, operation, result: 'UPDATED' },
        },
        { hostsList: { hosts: [{ id: groupID, hostname }] } }
      );

      expect(dispatched).toEqual([
        removeRunningOperation({ groupID }),
        notify({
          text: `Operation ${KNOWN_OPERATION_LABEL} succeeded for ${hostname}`,
          icon: '✅',
        }),
      ]);
    });

    it('should complete successfully a cluster operation', async () => {
      const groupID = faker.string.uuid();
      const operation = CLUSTER_MAINTENANCE_CHANGE;
      const name = faker.internet.displayName();
      const label = getOperationLabel(operation);

      const dispatched = await recordSaga(
        completeOperation,
        {
          payload: { groupID, operation, result: 'UPDATED' },
        },
        { clustersList: { clusters: [{ id: groupID, name }] } }
      );

      expect(dispatched).toEqual([
        removeRunningOperation({ groupID }),
        notify({
          text: `Operation ${label} succeeded for ${name}`,
          icon: '✅',
        }),
      ]);
    });

    it('should complete an operation with a failed result', async () => {
      const groupID = faker.string.uuid();
      const operation = KNOWN_OPERATION;
      const hostname = faker.internet.displayName();

      const dispatched = await recordSaga(
        completeOperation,
        {
          payload: { groupID, operation, result: 'FAILED' },
        },
        { hostsList: { hosts: [{ id: groupID, hostname }] } }
      );

      expect(dispatched).toEqual([
        removeRunningOperation({ groupID }),
        notify({
          text: `Operation ${KNOWN_OPERATION_LABEL} failed for ${hostname}`,
          icon: '❌',
        }),
      ]);
    });
  });

  describe('update running operation', () => {
    it('should update running operations state for a group when the operation is running', async () => {
      const groupID = faker.string.uuid();
      const operation = 'saptuneapplysolution@v1';

      axiosMock.onGet(getOperationExecutionsURL(groupID)).reply(200, {
        items: [{ operation, status: 'running' }],
        total_count: 1,
      });

      const dispatched = await recordSaga(updateRunningOperation, {
        payload: { groupID },
      });

      expect(dispatched).toEqual([
        setRunningOperation({ groupID, operation: SAPTUNE_SOLUTION_APPLY }),
      ]);
    });

    it('should not update running operations state for a group when the operation is completed', async () => {
      const groupID = faker.string.uuid();
      const operation = KNOWN_OPERATION;

      axiosMock.onGet(getOperationExecutionsURL(groupID)).reply(200, {
        items: [{ operation, status: 'completed' }],
        total_count: 1,
      });

      const dispatched = await recordSaga(updateRunningOperation, {
        payload: { groupID },
      });

      expect(dispatched).toEqual([]);
    });

    it('should not update running operations state for a group when there is not any operation', async () => {
      const groupID = faker.string.uuid();

      axiosMock.onGet(getOperationExecutionsURL(groupID)).reply(200, {
        items: [],
        total_count: 0,
      });

      const dispatched = await recordSaga(updateRunningOperation, {
        payload: { groupID },
      });

      expect(dispatched).toEqual([]);
    });

    it('should not update running operations state for a group when the api call fails', async () => {
      const groupID = faker.string.uuid();

      axiosMock.onGet(getOperationExecutionsURL(groupID)).reply(400, {});

      const dispatched = await recordSaga(updateRunningOperation, {
        payload: { groupID },
      });

      expect(dispatched).toEqual([]);
    });
  });
});
