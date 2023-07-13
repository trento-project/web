import { call, put, select, takeEvery } from 'redux-saga/effects';
import { post } from '@lib/network';

import { notify } from '@state/actions/notifications';
import {
  CLUSTER_DEREGISTERED,
  CLUSTER_CHECKS_SELECTED,
  removeCluster,
  updateSelectedChecks,
} from '@state/clusters';
import {
  setClusterChecksSelectionSavingError,
  setClusterChecksSelectionSavingSuccess,
  startSavingClusterChecksSelection,
  stopSavingClusterChecksSelection,
} from '@state/clusterChecksSelection';
import { getClusterName } from '@state/selectors/cluster';

export function* checksSelected({ payload }) {
  yield put(startSavingClusterChecksSelection());

  const clusterName = yield select(getClusterName(payload.clusterID));

  try {
    yield call(post, `/clusters/${payload.clusterID}/checks`, {
      checks: payload.checks,
    });
    yield put(updateSelectedChecks(payload));

    yield put(
      notify({
        text: `Checks selection for ${clusterName} saved`,
        icon: '💾',
      })
    );
    yield put(setClusterChecksSelectionSavingSuccess());
  } catch (error) {
    yield put(
      notify({
        text: `Unable to save selection for ${clusterName}`,
        icon: '❌',
      })
    );
    yield put(setClusterChecksSelectionSavingError());
  }
  yield put(stopSavingClusterChecksSelection());
}

export function* clusterDeregistered({ payload: { name, id } }) {
  yield put(removeCluster({ id }));
  yield put(
    notify({
      text: `The cluster ${name || id} has been deregistered.`,
      icon: 'ℹ️',
    })
  );
}

export function* watchClusterChecksSelection() {
  yield takeEvery(CLUSTER_CHECKS_SELECTED, checksSelected);
}

export function* watchClusterDeregistered() {
  yield takeEvery(CLUSTER_DEREGISTERED, clusterDeregistered);
}
