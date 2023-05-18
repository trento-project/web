import { put, takeEvery } from 'redux-saga/effects';
import { CLUSTER_DEREGISTERED, removeCluster } from '@state/clusters';
import { appendEntryToLiveFeed } from '@state/liveFeed';
import { notify } from '@state/actions/notifications';

export function* clusterDeregistered({ payload }) {
  yield put(removeCluster(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.name || payload.id,
      message: 'Cluster deregistered.',
    })
  );
  yield put(
    notify({
      text: `The cluster ${payload.name || payload.id} has been deregistered.`,
      icon: 'ℹ️',
    })
  );
}

export function* watchClusterDeregistered() {
  yield takeEvery(CLUSTER_DEREGISTERED, clusterDeregistered);
}
