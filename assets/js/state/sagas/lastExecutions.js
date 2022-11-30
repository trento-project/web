import { put, call, takeEvery } from 'redux-saga/effects';

import { updateLastExecutionAction } from '@state/actions/lastExecutions';
import { getLastExecutionByGroupID } from '@lib/api/wanda';
import {
  setLastExecutionLoading,
  setLastExecution,
  setLastExecutionEmpty,
  setLastExecutionError,
} from '@state/lastExecutions';

export function* updateLastExecution({ payload }) {
  const { groupID } = payload;

  yield put(setLastExecutionLoading(groupID));

  try {
    const { data } = yield call(getLastExecutionByGroupID, groupID);

    yield put(setLastExecution(data));
  } catch (error) {
    if (error.response && error.response.status == 404) {
      yield put(setLastExecutionEmpty(groupID));

      return;
    }

    yield put(
      setLastExecutionError({ groupID: groupID, error: error.message })
    );
  }
}

export function* watchUpdateLastExecution() {
  yield takeEvery(updateLastExecutionAction, updateLastExecution);
}
