import { put, call, takeEvery } from 'redux-saga/effects';
import { post } from '@lib/network';

import { TARGET_HOST } from '@lib/model';

import { notify } from '@state/actions/notifications';

import {
  HOST_CHECKS_SELECTED,
  startSavingChecksSelection,
  setSavingSuccessful,
  setSavingFailed,
} from '@state/checksSelection';

import { updateSelectedChecks as updateHostSelectedChecks } from '@state/hosts';

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

function* saveChecksSelection(targetID, targetType, checks) {
  switch (targetType) {
    case TARGET_HOST:
      yield saveHostChecksSelection({
        hostID: targetID,
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

export function* watchChecksSelection() {
  yield takeEvery(HOST_CHECKS_SELECTED, selectHostChecks);
}
