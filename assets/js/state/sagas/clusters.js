import { put, takeEvery } from 'redux-saga/effects';

import { notify } from '@state/notifications';
import {
  CLUSTER_REGISTERED,
  CLUSTER_CIB_LAST_WRITTEN_UPDATED,
  CLUSTER_DETAILS_UPDATED,
  CLUSTER_DEREGISTERED,
  CLUSTER_RESTORED,
  CLUSTER_HEALTH_CHANGED,
  appendCluster,
  removeCluster,
  updateCluster,
  updateClusterHealth,
  updateCibLastWritten,
} from '@state/clusters';

export function* clusterRegistered({ payload }) {
  yield put(appendCluster(payload));
  yield put(
    notify({
      text: `A new cluster, ${payload.name}, has been discovered.`,
      icon: 'ℹ️',
    })
  );
}

function* cibLastWrittenUpdated({ payload }) {
  yield put(updateCibLastWritten(payload));
}

function* clusterDetailsUpdated({ payload }) {
  yield put(updateCluster(payload));
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

export function* clusterRestored({ payload }) {
  yield put(appendCluster(payload));
  yield put(
    notify({
      text: `Cluster ${payload.name} has been restored.`,
      icon: 'ℹ️',
    })
  );
}

export function* clusterHealthChanged({
  payload: { cluster_id, name, health },
}) {
  yield put(updateClusterHealth({ cluster_id, name, health }));
  yield put(
    notify({
      text: `Cluster ${name} health changed to ${health}.`,
      icon: 'ℹ️',
    })
  );
}

export function* watchClusterEvents() {
  yield takeEvery(CLUSTER_REGISTERED, clusterRegistered);
  yield takeEvery(CLUSTER_CIB_LAST_WRITTEN_UPDATED, cibLastWrittenUpdated);
  yield takeEvery(CLUSTER_DETAILS_UPDATED, clusterDetailsUpdated);
  yield takeEvery(CLUSTER_HEALTH_CHANGED, clusterHealthChanged);
  yield takeEvery(CLUSTER_DEREGISTERED, clusterDeregistered);
  yield takeEvery(CLUSTER_RESTORED, clusterRestored);
}
