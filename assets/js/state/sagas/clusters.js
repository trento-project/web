import { put, takeEvery } from 'redux-saga/effects';
import { CLUSTER_DEREGISTERED, removeCluster } from '@state/clusters';
import { appendEntryToLiveFeed } from '@state/liveFeed';
import { notify } from '@state/actions/notifications';

export function* clusterDeregistered({ payload: { name, cluster_id } }) {
  yield put(removeCluster({ id: cluster_id }));
  yield put(
    appendEntryToLiveFeed({
      source: name || cluster_id,
      message: 'Cluster deregistered.',
    })
  );
  yield put(
    notify({
      text: `The cluster ${name || cluster_id} has been deregistered.`,
      icon: 'ℹ️',
    })
  );
}

export function* watchClusterDeregistered() {
  yield takeEvery(CLUSTER_DEREGISTERED, clusterDeregistered);
}
