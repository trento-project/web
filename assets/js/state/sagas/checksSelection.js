import { put, call, takeEvery } from 'redux-saga/effects';
import { post } from '@lib/network';

import { TARGET_HOST, TARGET_CLUSTER } from '@lib/model';

import { notify } from '@state/notifications';

import {
  HOST_CHECKS_SELECTED,
  CLUSTER_CHECKS_SELECTED,
  startSavingChecksSelection,
  setSavingSuccessful,
  setSavingFailed,
} from '@state/checksSelection';

import { updateSelectedChecks as updateHostSelectedChecks } from '@state/hosts';
import { updateSelectedChecks as updateClusterSelectedChecks } from '@state/clusters';

function* saveHostChecksSelection({ hostID, checks }) {
  yield call(post, `/hosts/${hostID}/checks`, {
    checks,
  });
  yield put(
    updateHostSelectedChecks({
      hostID,
      checks,
    })
  );
}

function* saveClusterChecksSelection({ clusterID, checks }) {
  yield call(post, `/clusters/${clusterID}/checks`, {
    checks,
  });
  yield put(
    updateClusterSelectedChecks({
      clusterID,
      checks,
    })
  );
}

function* saveChecksSelection(targetID, targetType, checks) {
  switch (targetType) {
    case TARGET_HOST:
      yield saveHostChecksSelection({
        hostID: targetID,
        checks,
      });
      break;
    case TARGET_CLUSTER:
      yield saveClusterChecksSelection({
        clusterID: targetID,
        checks,
      });
      break;
    default:
  }
}

function* checksSelected({ targetID, targetType, targetName, checks }) {
  yield put(startSavingChecksSelection({ targetID, targetType }));

  try {
    yield saveChecksSelection(targetID, targetType, checks);

    yield put(setSavingSuccessful({ targetID, targetType }));
    yield put(
      notify({
        text: `Checks selection for ${targetName} saved`,
        icon: '💾',
      })
    );
  } catch (error) {
    yield put(setSavingFailed({ targetID, targetType }));
    yield put(
      notify({
        text: `Unable to save selection for ${targetName}`,
        icon: '❌',
      })
    );
  }
}

export function* selectHostChecks({ payload: { hostID, hostName, checks } }) {
  yield checksSelected({
    targetID: hostID,
    targetType: TARGET_HOST,
    targetName: hostName,
    checks,
  });
}

export function* selectClusterChecks({
  payload: { clusterID, clusterName, checks },
}) {
  yield checksSelected({
    targetID: clusterID,
    targetType: TARGET_CLUSTER,
    targetName: clusterName,
    checks,
  });
}

export function* watchChecksSelection() {
  yield takeEvery(HOST_CHECKS_SELECTED, selectHostChecks);
  yield takeEvery(CLUSTER_CHECKS_SELECTED, selectClusterChecks);
}
