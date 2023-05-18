import { put } from 'redux-saga/effects';
import { removeSAPSystem } from '@state/sapSystems';
import { appendEntryToLiveFeed } from '@state/liveFeed';
import { notify } from '@state/actions/notifications';

export function* sapSystemDeregistered({ payload }) {
  yield put(removeSAPSystem(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.sid,
      message: 'SAP System deregistered.',
    })
  );
  yield put(
    notify({
      text: `The SAP System ${payload.sid} has been deregistered.`,
      icon: 'ℹ️',
    })
  );
}
