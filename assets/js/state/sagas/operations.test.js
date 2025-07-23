import MockAdapter from 'axios-mock-adapter';
import { faker } from '@faker-js/faker';

import { recordSaga } from '@lib/test-utils';
import { networkClient } from '@lib/network';

import {
  SAPTUNE_SOLUTION_APPLY,
  CLUSTER_MAINTENANCE_CHANGE,
  SAP_INSTANCE_START,
  SAP_SYSTEM_START,
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
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
  updateRunningOperations,
} from './operations';

const axiosMock = new MockAdapter(networkClient);
const hostOperationRequestURL = (hostID, operation) =>
  `/hosts/${hostID}/operations/${operation}`;

const clusterOperationRequestURL = (clusterID, operation) =>
  `/clusters/${clusterID}/operations/${operation}`;

const clusterHostOperationRequestURL = (clusterID, hostID, operation) =>
  `/clusters/${clusterID}/hosts/${hostID}/operations/${operation}`;

const sapSystemOperationRequestURL = (sapSystemID, operation) =>
  `/sap_systems/${sapSystemID}/operations/${operation}`;

const sapInstanceOperationRequestedURL = (
  sapSystemID,
  hostID,
  instanceNumber,
  operation
) =>
  `/sap_systems/${sapSystemID}/hosts/${hostID}/instances/${instanceNumber}/operations/${operation}`;

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
          payload: { groupID, operation, requestParams: { hostID: groupID } },
        },
        { hostsList: { hosts: [{ id: groupID, hostname }] } }
      );

      expect(dispatched).toEqual([
        setRunningOperation({
          groupID,
          operation,
          metadata: { hostID: groupID },
        }),
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
          payload: {
            groupID,
            operation,
            requestParams: { clusterID: groupID },
          },
        },
        { clustersList: { clusters: [{ id: groupID, name }] } }
      );

      expect(dispatched).toEqual([
        setRunningOperation({
          groupID,
          operation,
          metadata: { clusterID: groupID },
        }),
        notify({
          text: `Operation ${label} requested for ${name}`,
          icon: '⚙️',
        }),
      ]);
    });

    it('should request a SAP instance operation', async () => {
      const groupID = faker.string.uuid();
      const sapSystemID = faker.string.uuid();
      const instanceNumber = '00';
      const operation = SAP_INSTANCE_START;
      const hostname = faker.internet.displayName();
      const label = getOperationLabel(operation);

      axiosMock
        .onPost(
          sapInstanceOperationRequestedURL(
            sapSystemID,
            groupID,
            instanceNumber,
            operation
          )
        )
        .reply(202, {});

      const dispatched = await recordSaga(
        requestOperation,
        {
          payload: {
            groupID,
            operation,
            requestParams: {
              sapSystemID,
              hostID: groupID,
              instanceNumber,
            },
          },
        },
        { hostsList: { hosts: [{ id: groupID, hostname }] } }
      );

      expect(dispatched).toEqual([
        setRunningOperation({
          groupID,
          operation,
          metadata: { sapSystemID, hostID: groupID, instanceNumber },
        }),
        notify({
          text: `Operation ${label} requested for ${hostname}`,
          icon: '⚙️',
        }),
      ]);
    });

    it('should request a SAP system operation', async () => {
      const groupID = faker.string.uuid();
      const operation = SAP_SYSTEM_START;
      const sid = 'PRD';
      const label = getOperationLabel(operation);

      axiosMock
        .onPost(sapSystemOperationRequestURL(groupID, operation))
        .reply(202, {});

      const dispatched = await recordSaga(
        requestOperation,
        {
          payload: {
            groupID,
            operation,
            requestParams: {
              sapSystemID: groupID,
            },
          },
        },
        { sapSystemsList: { sapSystems: [{ id: groupID, sid }] } }
      );

      expect(dispatched).toEqual([
        setRunningOperation({
          groupID,
          operation,
          metadata: { sapSystemID: groupID },
        }),
        notify({
          text: `Operation ${label} requested for ${sid}`,
          icon: '⚙️',
        }),
      ]);
    });

    it.each([PACEMAKER_ENABLE, PACEMAKER_DISABLE])(
      'should request a cluster host operation',
      async (operation) => {
        const groupID = faker.string.uuid();
        const hostID = faker.string.uuid();
        const name = faker.internet.displayName();
        const label = getOperationLabel(operation);

        axiosMock
          .onPost(clusterHostOperationRequestURL(groupID, hostID, operation))
          .reply(202, {});

        const dispatched = await recordSaga(
          requestOperation,
          {
            payload: {
              groupID,
              operation,
              requestParams: { clusterID: groupID, hostID },
            },
          },
          { clustersList: { clusters: [{ id: groupID, name }] } }
        );

        expect(dispatched).toEqual([
          setRunningOperation({
            groupID,
            operation,
            metadata: { clusterID: groupID, hostID },
          }),
          notify({
            text: `Operation ${label} requested for ${name}`,
            icon: '⚙️',
          }),
        ]);
      }
    );

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
          payload: { groupID, operation, requestParams: { hostID: groupID } },
        },
        { hostsList: { hosts: [{ id: groupID, hostname }] } }
      );

      expect(dispatched).toEqual([
        setRunningOperation({
          groupID,
          operation,
          metadata: { hostID: groupID },
        }),
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
          payload: { groupID, operation, requestParams: { hostID: groupID } },
        },
        { hostsList: { hosts: [{ id: groupID, hostname }] } }
      );

      expect(dispatched).toEqual([
        setRunningOperation({
          groupID,
          operation,
          metadata: { hostID: groupID },
        }),
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

    it.each([PACEMAKER_ENABLE, PACEMAKER_DISABLE])(
      'should complete successfully a cluster host operation',
      async (operation) => {
        const groupID = faker.string.uuid();
        const name = faker.internet.displayName();

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
            text: `Operation ${getOperationLabel(operation)} succeeded for ${name}`,
            icon: '✅',
          }),
        ]);
      }
    );

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

  describe('update running operations', () => {
    it('should update running operations state when the operation is running', async () => {
      const operation1 = 'saptuneapplysolution@v1';
      const operation2 = 'clustermaintenancechange@v1';
      const groupID1 = faker.string.uuid();
      const groupID2 = faker.string.uuid();

      axiosMock.onGet(getOperationExecutionsURL()).reply(200, {
        items: [
          {
            group_id: groupID1,
            operation: operation1,
            status: 'running',
            targets: [],
          },
          {
            group_id: groupID2,
            operation: operation2,
            status: 'running',
            targets: [],
          },
        ],
      });

      const dispatched = await recordSaga(updateRunningOperations, {
        payload: {},
      });

      expect(dispatched).toEqual([
        setRunningOperation({
          groupID: groupID1,
          operation: SAPTUNE_SOLUTION_APPLY,
          metadata: { targets: [] },
        }),
        setRunningOperation({
          groupID: groupID2,
          operation: CLUSTER_MAINTENANCE_CHANGE,
          metadata: { targets: [] },
        }),
      ]);
    });

    it('should not update running operations state when there is not any operation', async () => {
      axiosMock.onGet(getOperationExecutionsURL()).reply(200, {
        items: [],
      });

      const dispatched = await recordSaga(updateRunningOperations, {
        payload: {},
      });

      expect(dispatched).toEqual([]);
    });

    it('should not update running operations state when the api call fails', async () => {
      axiosMock.onGet(getOperationExecutionsURL()).reply(400, {});

      const dispatched = await recordSaga(updateRunningOperations, {
        payload: {},
      });

      expect(dispatched).toEqual([]);
    });
  });
});
