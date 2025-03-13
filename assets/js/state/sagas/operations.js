import { call, put, select, takeEvery } from 'redux-saga/effects';
import { map } from 'lodash';

import {
  HOST_OPERATION,
  getOperationLabel,
  getOperationInternalName,
  getOperationResourceType,
  getOperationRequestFunc,
  operationRunning,
  operationSucceeded,
} from '@lib/operations';
import { getOperationExecutions } from '@lib/api/operations';
import { notify } from '@state/notifications';
import {
  OPERATION_COMPLETED,
  OPERATION_REQUESTED,
  UPDATE_RUNNING_OPERATION,
  removeRunningOperation,
  setForbiddenOperation,
  setRunningOperation,
} from '@state/runningOperations';
import { getHost } from '@state/selectors/host';

function* getResourceName({ groupID, resourceType }) {
  switch (resourceType) {
    case HOST_OPERATION:
      return (yield select(getHost(groupID)))?.hostname || 'unknown';
    default:
      return 'unknown';
  }
}

export function* requestOperation({ payload }) {
  const { groupID, operation, params } = payload;

  const operationName = getOperationLabel(operation);
  const operationResourceType = getOperationResourceType(operation);
  const requestFunc = getOperationRequestFunc(operationResourceType);
  const resourceName = yield call(getResourceName, {
    groupID,
    resourceType: operationResourceType,
  });
  yield put(setRunningOperation({ groupID, operation }));
  try {
    yield call(requestFunc, groupID, operation, params);
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

export function* completeOperation({ payload }) {
  const { groupID, operation, result } = payload;

  const operationName = getOperationLabel(operation);
  const operationResourceType = getOperationResourceType(operation);
  const resourceName = yield call(getResourceName, {
    groupID,
    resourceType: operationResourceType,
  });
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

export function* updateRunningOperation({ payload }) {
  const { groupID } = payload;

  try {
    const {
      data: {
        items: [operationItem],
        total_count: totalCount,
      },
    } = yield call(getOperationExecutions, {
      group_id: groupID,
      items_per_page: 1,
    });
    if (totalCount === 1 && operationRunning(operationItem)) {
      const operation = getOperationInternalName(operationItem.operation);
      yield put(setRunningOperation({ groupID, operation }));
    }
  } catch {
    /* empty */
  }
}

export function* watchOperationEvents() {
  yield takeEvery(OPERATION_COMPLETED, completeOperation);
  yield takeEvery(OPERATION_REQUESTED, requestOperation);
  yield takeEvery(UPDATE_RUNNING_OPERATION, updateRunningOperation);
}
