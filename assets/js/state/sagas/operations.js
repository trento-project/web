// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import { noop } from 'lodash';

import {
  HOST_OPERATION,
  CLUSTER_OPERATION,
  SAP_SYSTEM_OPERATION,
  APPLICATION_INSTANCE_OPERATION,
  CLUSTER_HOST_OPERATION,
  DATABASE_OPERATION,
  getOperationLabel,
  getOperationInternalName,
  getOperationResourceType,
  operationSucceeded,
} from '@lib/operations';
import {
  requestHostOperation,
  requestClusterOperation,
  requestClusterBulkOperation,
  requestSapSystemOperation,
  requestSapInstanceOperation,
  requestClusterHostOperation,
  requestDatabaseOperation,
  getOperationExecutions,
} from '@lib/api/operations';
import { notify } from '@state/notifications';
import {
  BULK_OPERATION_REQUESTED,
  OPERATION_COMPLETED,
  OPERATION_REQUESTED,
  UPDATE_RUNNING_OPERATIONS,
  removeRunningOperation,
  setForbiddenOperation,
  setRunningOperation,
} from '@state/runningOperations';
import { getHost } from '@state/selectors/host';
import { getCluster } from '@state/selectors/cluster';
import { getSapSystem, getDatabase } from '@state/selectors/sapSystem';

function* getResourceName(groupID, resourceType) {
  switch (resourceType) {
    case HOST_OPERATION:
    case APPLICATION_INSTANCE_OPERATION:
      return (yield select(getHost(groupID)))?.hostname || 'unknown';
    case CLUSTER_OPERATION:
    case CLUSTER_HOST_OPERATION: {
      return (yield select(getCluster(groupID)))?.name || 'unknown';
    }
    case SAP_SYSTEM_OPERATION:
      return (yield select(getSapSystem(groupID)))?.sid || 'unknown';
    case DATABASE_OPERATION:
      return (yield select(getDatabase(groupID)))?.sid || 'unknown';
    default:
      return 'unknown';
  }
}

const callRequest = (operation, resourceType, requestParams) => {
  switch (resourceType) {
    case HOST_OPERATION: {
      const { hostID, params } = requestParams;
      return requestHostOperation(hostID, operation, params);
    }
    case CLUSTER_OPERATION: {
      const { clusterID, params } = requestParams;
      return requestClusterOperation(clusterID, operation, params);
    }
    case SAP_SYSTEM_OPERATION: {
      const { sapSystemID, params } = requestParams;
      return requestSapSystemOperation(sapSystemID, operation, params);
    }
    case APPLICATION_INSTANCE_OPERATION: {
      const { sapSystemID, hostID, instanceNumber, params } = requestParams;
      return requestSapInstanceOperation(
        sapSystemID,
        hostID,
        instanceNumber,
        operation,
        params
      );
    }
    case CLUSTER_HOST_OPERATION: {
      const { clusterID, hostID } = requestParams;

      return requestClusterHostOperation(clusterID, hostID, operation);
    }
    case DATABASE_OPERATION: {
      const { databaseID, params } = requestParams;
      return requestDatabaseOperation(databaseID, operation, params);
    }
    default:
      return noop;
  }
};

export function* requestOperation({ payload }) {
  const { groupID, operation, requestParams } = payload;

  const operationName = getOperationLabel(operation);
  const operationResourceType = getOperationResourceType(operation);
  const resourceName = yield call(
    getResourceName,
    groupID,
    operationResourceType,
    requestParams
  );

  yield put(
    setRunningOperation({ groupID, operation, metadata: requestParams })
  );
  try {
    yield call(callRequest, operation, operationResourceType, requestParams);
    yield put(
      notify({
        text: `Operation ${operationName} requested for ${resourceName}`,
        icon: '⚙️',
      })
    );
  } catch ({ response: { status, data } }) {
    if (status === 403) {
      yield put(
        setForbiddenOperation({ groupID, operation, errors: data.errors })
      );
      return;
    }

    yield put(removeRunningOperation({ groupID }));
    yield put(
      notify({
        text: `Operation ${operationName} request for ${resourceName} failed`,
        icon: '❌',
      })
    );
  }
}

const BULK_OPERATION_RESOURCES = {
  [CLUSTER_OPERATION]: {
    label: 'clusters',
    request: requestClusterBulkOperation,
  },
};

// Running bulk operations are not tracked, as they are not displayed in that state
// anywhere. The state is only used to display forbidden requests.
// This code could be very well a async all or a share hook, but it is here
// to keep the logic all together.
export function* requestBulkOperation({ payload }) {
  const { bulkOperationID, targetGroupIDs, operation, params } = payload;

  const operationName = getOperationLabel(operation);
  const { label, request } =
    BULK_OPERATION_RESOURCES[getOperationResourceType(operation)];

  yield put(removeRunningOperation({ groupID: bulkOperationID }));

  try {
    const {
      data: { operations, failed_operations: failedOperations },
    } = yield call(request, targetGroupIDs, operation, params);
    const requestedText = `${operations.length + failedOperations.length} ${label}`;
    const failedText = failedOperations.length
      ? ` (${failedOperations.length} failed)`
      : '';
    yield put(
      notify({
        text: `Operation ${operationName} requested for ${requestedText}${failedText}`,
        icon: '⚙️',
      })
    );
  } catch ({ response: { status, data } }) {
    if (status === 403) {
      yield put(
        setForbiddenOperation({
          groupID: bulkOperationID,
          operation,
          errors: data.errors,
        })
      );
      return;
    }

    yield put(
      notify({
        text: `Operation ${operationName} request for ${label} failed`,
        icon: '❌',
      })
    );
  }
}

export function* completeOperation({ payload }) {
  const { groupID, operation, result } = payload;

  const operationName = getOperationLabel(operation);
  const operationResourceType = getOperationResourceType(operation);
  const resourceName = yield call(
    getResourceName,
    groupID,
    operationResourceType
  );
  yield put(removeRunningOperation({ groupID }));
  if (operationSucceeded(result)) {
    yield put(
      notify({
        text: `Operation ${operationName} succeeded for ${resourceName}`,
        icon: '✅',
      })
    );
  } else {
    yield put(
      notify({
        text: `Operation ${operationName} failed for ${resourceName}`,
        icon: '❌',
      })
    );
  }
}

export function* updateRunningOperations() {
  try {
    const {
      data: { items: runningOperations },
    } = yield call(getOperationExecutions, {
      status: 'running',
    });
    yield all(
      runningOperations.map((runningOperation) => {
        const operation = getOperationInternalName(runningOperation.operation);
        return put(
          setRunningOperation({
            groupID: runningOperation.group_id,
            operation,
            // metadata: temporary solution to reconcile information of running operations
            // the long term goal is to have a homogeneous shape for metadata in the state
            metadata: { targets: runningOperation.targets },
          })
        );
      })
    );
  } catch {
    /* empty */
  }
}

export function* watchOperationEvents() {
  yield takeEvery(OPERATION_COMPLETED, completeOperation);
  yield takeEvery(OPERATION_REQUESTED, requestOperation);
  yield takeEvery(BULK_OPERATION_REQUESTED, requestBulkOperation);
  yield takeEvery(UPDATE_RUNNING_OPERATIONS, updateRunningOperations);
}
