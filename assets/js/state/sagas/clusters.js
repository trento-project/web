import { put, takeEvery } from 'redux-saga/effects';

import { notify } from '@state/actions/notifications';
import {
  CLUSTER_DEREGISTERED,
  CLUSTER_RESTORED,
  appendCluster,
  removeCluster,
  updateClusterHealth,
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

export function* clusterHealthChanged({ payload: { cluster_id, health } }) {
  yield put(updateClusterHealth({ cluster_id, health }));
  yield put(
    notify({
      text: `Cluster ${cluster_id} health changed to ${health}.`,
      icon: 'ℹ️',
    })
  );
}

export function* watchClusterHealthChanged() {
  yield takeEvery('CLUSTER_HEALTH_CHANGED', clusterHealthChanged);
}

export function* watchClusterDeregistered() {
  yield takeEvery(CLUSTER_DEREGISTERED, clusterDeregistered);
}

export function* watchClusterRestored() {
  yield takeEvery(CLUSTER_RESTORED, clusterRestored);
}
