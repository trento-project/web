import { put, takeEvery } from 'redux-saga/effects';
import { CLUSTER_DEREGISTERED, removeCluster } from '@state/clusters';
import { notify } from '@state/actions/notifications';

export function* clusterDeregistered({ payload: { name, id } }) {
  yield put(removeCluster({ id }));
  yield put(
    notify({
      text: `The cluster ${name || id} has been deregistered.`,
      icon: 'ℹ️',
    })
  );
}

export function* watchClusterDeregistered() {
  yield takeEvery(CLUSTER_DEREGISTERED, clusterDeregistered);
}
