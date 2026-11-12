// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import MockAdapter from 'axios-mock-adapter';
import { faker } from '@faker-js/faker';

import { recordSaga } from '@lib/test-utils';
import { networkClient } from '@lib/network';

import {
  SAPTUNE_SOLUTION_APPLY,
  CLUSTER_MAINTENANCE_CHANGE,
  CLUSTER_RESOURCE_REFRESH,
  SAP_INSTANCE_START,
  SAP_SYSTEM_START,
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
  DATABASE_START,
  HOST_REBOOT,
  getOperationLabel,
} from '@lib/operations';
import {
  CLUSTER_BULK_OPERATION_ID,
  HOST_BULK_OPERATION_ID,
  removeRunningOperation,
  setRunningOperation,
  setForbiddenOperation,
} from '@state/runningOperations';
import { notify } from '@state/notifications';

import {
  requestOperation,
  requestBulkOperation,
  completeOperation,
  updateRunningOperations,
} from './operations';

const axiosMock = new MockAdapter(networkClient);
const hostOperationRequestURL = (hostID, operation) =>
  `/hosts/${hostID}/operations/${operation}`;

const clusterOperationRequestURL = (clusterID, operation) =>
  `/clusters/${clusterID}/operations/${operation}`;

const clusterBulkOperationRequestURL = (operation) =>
  `/clusters/operations/${operation}/bulk`;

const hostBulkOperationRequestURL = (operation) =>
  `/hosts/operations/${operation}/bulk`;

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

const databaseOperationRequestURL = (databaseID, operation) =>
  `/databases/${databaseID}/operations/${operation}`;

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

    it('should request a database operation', async () => {
      const groupID = faker.string.uuid();
      const operation = DATABASE_START;
      const sid = 'PRD';
      const label = getOperationLabel(operation);

      axiosMock
        .onPost(databaseOperationRequestURL(groupID, operation))
        .reply(202, {});

      const dispatched = await recordSaga(
        requestOperation,
        {
          payload: {
            groupID,
            operation,
            requestParams: {
              databaseID: groupID,
            },
          },
        },
        { databasesList: { databases: [{ id: groupID, sid }] } }
      );

      expect(dispatched).toEqual([
        setRunningOperation({
          groupID,
          operation,
          metadata: { databaseID: groupID },
        }),
        notify({
          text: `Operation ${label} requested for ${sid}`,
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
      const errors = [
        { detail: 'error1', metadata: [{ key: 'value' }] },
        { detail: 'error2' },
      ];

      axiosMock
        .onPost(hostOperationRequestURL(groupID, operation))
        .reply(403, { errors });

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
          errors,
        }),
      ]);
    });
  });

  describe('request bulk operation', () => {
    const bulkResources = [
      {
        resource: 'clusters',
        bulkOperationID: CLUSTER_BULK_OPERATION_ID,
        requestURL: clusterBulkOperationRequestURL,
        idsKey: 'cluster_ids',
        defaultOperation: CLUSTER_RESOURCE_REFRESH,
        successScenarios: [
          {
            operation: CLUSTER_MAINTENANCE_CHANGE,
            params: { maintenance: true },
          },
          { operation: CLUSTER_RESOURCE_REFRESH, params: undefined },
        ],
      },
    ];

    describe.each(bulkResources)(
      '$resource',
      ({
        resource,
        bulkOperationID,
        requestURL,
        idsKey,
        defaultOperation,
        successScenarios,
      }) => {
        it.each(successScenarios)(
          'should request a bulk operation $operation',
          async ({ operation, params }) => {
            const label = getOperationLabel(operation);
            const resourceID1 = faker.string.uuid();
            const resourceID2 = faker.string.uuid();
            const targetGroupIDs = [resourceID1, resourceID2];

            axiosMock
              .onPost(requestURL(operation), {
                [idsKey]: targetGroupIDs,
                ...(params && { params }),
              })
              .reply(202, {
                operations: [
                  { resource_id: resourceID1 },
                  { resource_id: resourceID2 },
                ],
                failed_requests: [],
              });

            const dispatched = await recordSaga(requestBulkOperation, {
              payload: { bulkOperationID, targetGroupIDs, operation, params },
            });

            expect(dispatched).toEqual([
              removeRunningOperation({ groupID: bulkOperationID }),
              notify({
                text: `Operation ${label} requested on 2 ${resource}`,
                icon: '⚙️',
              }),
            ]);
          }
        );

        it('should report the failed requests in a bulk operation', async () => {
          const operation = defaultOperation;
          const label = getOperationLabel(operation);
          const passingResourceID1 = faker.string.uuid();
          const passingResourceID2 = faker.string.uuid();
          const failingResourceID = faker.string.uuid();
          const targetGroupIDs = [
            passingResourceID1,
            passingResourceID2,
            failingResourceID,
          ];

          axiosMock.onPost(requestURL(operation)).reply(202, {
            operations: [
              { resource_id: passingResourceID1 },
              { resource_id: passingResourceID2 },
            ],
            failed_requests: [{ resource_id: failingResourceID }],
          });

          const dispatched = await recordSaga(requestBulkOperation, {
            payload: { bulkOperationID, targetGroupIDs, operation },
          });

          expect(dispatched).toEqual([
            removeRunningOperation({ groupID: bulkOperationID }),
            notify({
              text: `Operation ${label} requested on 3 ${resource} (1 failed)`,
              icon: '⚙️',
            }),
          ]);
        });

        it.each([
          {
            name: '500 error',
            mockFailure: (request) => request.reply(500, {}),
          },
          {
            name: 'network error',
            mockFailure: (request) => request.networkError(),
          },
        ])(
          'should fail requesting a bulk operation if the api request fails with a $name',
          async ({ mockFailure }) => {
            const operation = defaultOperation;
            const label = getOperationLabel(operation);
            const targetGroupIDs = [faker.string.uuid()];

            mockFailure(axiosMock.onPost(requestURL(operation)));

            const dispatched = await recordSaga(requestBulkOperation, {
              payload: { bulkOperationID, targetGroupIDs, operation },
            });

            expect(dispatched).toEqual([
              removeRunningOperation({ groupID: bulkOperationID }),
              notify({
                text: `Operation ${label} request for ${resource} failed`,
                icon: '❌',
              }),
            ]);
          }
        );

        it('should fail requesting a bulk operation if the api request is forbidden', async () => {
          const operation = defaultOperation;
          const targetGroupIDs = [faker.string.uuid()];
          const errors = [
            { detail: 'error1', metadata: [{ key: 'value' }] },
            { detail: 'error2' },
          ];

          axiosMock.onPost(requestURL(operation)).reply(403, { errors });

          const dispatched = await recordSaga(requestBulkOperation, {
            payload: { bulkOperationID, targetGroupIDs, operation },
          });

          expect(dispatched).toEqual([
            removeRunningOperation({ groupID: bulkOperationID }),
            setForbiddenOperation({
              groupID: bulkOperationID,
              operation,
              errors,
            }),
          ]);
        });
      }
    );
  });

  describe('request host bulk operation', () => {
    it('should request a host bulk operation', async () => {
      const bulkOperationID = HOST_BULK_OPERATION_ID;
      const operation = HOST_REBOOT;
      const label = getOperationLabel(operation);
      const hostID1 = faker.string.uuid();
      const hostID2 = faker.string.uuid();
      const targetGroupIDs = [hostID1, hostID2];

      axiosMock.onPost(hostBulkOperationRequestURL(operation)).reply(202, {
        operations: [{ resource_id: hostID1 }, { resource_id: hostID2 }],
        failed_requests: [],
      });

      const dispatched = await recordSaga(requestBulkOperation, {
        payload: { bulkOperationID, targetGroupIDs, operation, params: {} },
      });

      expect(JSON.parse(axiosMock.history.post.at(-1).data)).toEqual({
        host_ids: targetGroupIDs,
      });
      expect(dispatched).toEqual([
        removeRunningOperation({ groupID: bulkOperationID }),
        notify({
          text: `Operation ${label} requested on 2 hosts`,
          icon: '⚙️',
        }),
      ]);
    });

    it('should report the failed requests in a host bulk operation', async () => {
      const bulkOperationID = HOST_BULK_OPERATION_ID;
      const operation = HOST_REBOOT;
      const label = getOperationLabel(operation);
      const passingHostID1 = faker.string.uuid();
      const passingHostID2 = faker.string.uuid();
      const failingHostID = faker.string.uuid();
      const targetGroupIDs = [passingHostID1, passingHostID2, failingHostID];

      axiosMock.onPost(hostBulkOperationRequestURL(operation)).reply(202, {
        operations: [
          { resource_id: passingHostID1 },
          { resource_id: passingHostID2 },
        ],
        failed_requests: [{ resource_id: failingHostID }],
      });

      const dispatched = await recordSaga(requestBulkOperation, {
        payload: { bulkOperationID, targetGroupIDs, operation },
      });

      expect(dispatched).toEqual([
        removeRunningOperation({ groupID: bulkOperationID }),
        notify({
          text: `Operation ${label} requested on 3 hosts (1 failed)`,
          icon: '⚙️',
        }),
      ]);
    });

    it('should fail requesting a host bulk operation if the api request fails', async () => {
      const bulkOperationID = HOST_BULK_OPERATION_ID;
      const operation = HOST_REBOOT;
      const label = getOperationLabel(operation);
      const targetGroupIDs = [faker.string.uuid()];

      axiosMock.onPost(hostBulkOperationRequestURL(operation)).reply(500, {});

      const dispatched = await recordSaga(requestBulkOperation, {
        payload: { bulkOperationID, targetGroupIDs, operation },
      });

      expect(dispatched).toEqual([
        removeRunningOperation({ groupID: bulkOperationID }),
        notify({
          text: `Operation ${label} request for hosts failed`,
          icon: '❌',
        }),
      ]);
    });

    it('should fail requesting a host bulk operation if the api request is forbidden', async () => {
      const bulkOperationID = HOST_BULK_OPERATION_ID;
      const operation = HOST_REBOOT;
      const targetGroupIDs = [faker.string.uuid()];
      const errors = [
        { detail: 'error1', metadata: [{ key: 'value' }] },
        { detail: 'error2' },
      ];

      axiosMock
        .onPost(hostBulkOperationRequestURL(operation))
        .reply(403, { errors });

      const dispatched = await recordSaga(requestBulkOperation, {
        payload: { bulkOperationID, targetGroupIDs, operation },
      });

      expect(dispatched).toEqual([
        removeRunningOperation({ groupID: bulkOperationID }),
        setForbiddenOperation({
          groupID: bulkOperationID,
          operation,
          errors,
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
