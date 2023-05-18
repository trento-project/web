import { put } from 'redux-saga/effects';
import { removeCluster } from '@state/clusters';
import { appendEntryToLiveFeed } from '@state/liveFeed';
import { notify } from '@state/actions/notifications';

export function* clusterDeregistered({ payload }) {
  yield put(removeCluster(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.name,
      message: 'Cluster deregistered.',
    })
  );
  yield put(
    notify({
      text: `The cluster ${payload.name} has been deregistered.`,
      icon: 'ℹ️',
    })
  );
}
