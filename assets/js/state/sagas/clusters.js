import { put, takeEvery } from 'redux-saga/effects';

import { notify } from '@state/actions/notifications';
import {
  CLUSTER_DEREGISTERED,
  CLUSTER_RESTORED,
  appendCluster,
  removeCluster,
} from '@state/clusters';

export function* clusterDeregistered({ payload: { name, id } }) {
  yield put(removeCluster({ id }));
  yield put(
    notify({
      text: `The cluster ${name || id} has been deregistered.`,
      icon: 'ℹ️',
    })
  );
}

export function* clusterRestored({ payload }) {
  yield put(appendCluster(payload));
  yield put(
    notify({
      text: `Cluster ${payload.name} has been restored.`,
      icon: 'ℹ️',
    })
  );
}

export function* watchClusterDeregistered() {
  yield takeEvery(CLUSTER_DEREGISTERED, clusterDeregistered);
}

export function* watchClusterRestored() {
  yield takeEvery(CLUSTER_RESTORED, clusterRestored);
}
