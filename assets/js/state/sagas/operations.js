import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import { map, noop } from 'lodash';

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
  requestSapSystemOperation,
  requestSapInstanceOperation,
  requestClusterHostOperation,
  requestDatabaseOperation,
  getOperationExecutions,
  requestHostOperationPreflight
} from '@lib/api/operations';
import { notify } from '@state/notifications';
import {
  OPERATION_COMPLETED,
  OPERATION_REQUESTED,
  UPDATE_RUNNING_OPERATIONS,
  removeRunningOperation,
  setForbiddenOperation,
  setRunningOperation,
} from '@state/runningOperations';

import {
  setPreflightOperation,
  OPERATION_PREFLIGHT_REQUESTED
} from '@state/preflightOperations';

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

const callRequestPreflight = (operation, resourceType, groupID) => {
  switch (resourceType) {
    case HOST_OPERATION: {
      return requestHostOperationPreflight(groupID, operation);
    }
    case CLUSTER_OPERATION:
    case SAP_SYSTEM_OPERATION:
    case APPLICATION_INSTANCE_OPERATION:
    case CLUSTER_HOST_OPERATION:
    case DATABASE_OPERATION:
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
      const errors = map(data.errors, 'detail');
      yield put(setForbiddenOperation({ groupID, operation, errors }));
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

export function* requestOperationPreflight({ payload }) {
  const { groupID, operation } = payload;
  try {
    const operationResourceType = getOperationResourceType(operation);
    yield call(
      callRequestPreflight,
      operation,
      operationResourceType,
      groupID
    );
    yield put(setPreflightOperation({ groupID, operation, errors: [] }));
  } catch ({ response: { status, data } }) {
    const errors = map(data.errors, 'detail');
    yield put(setPreflightOperation({ groupID, operation, errors }));
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
  yield takeEvery(UPDATE_RUNNING_OPERATIONS, updateRunningOperations);
  yield takeEvery(OPERATION_PREFLIGHT_REQUESTED, requestOperationPreflight);
}
