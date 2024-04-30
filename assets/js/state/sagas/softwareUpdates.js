import { get } from 'lodash';
import { put, call, takeEvery } from 'redux-saga/effects';
import { getSoftwareUpdates } from '@lib/api/softwareUpdates';

import {
  FETCH_SOFTWARE_UPDATES,
  startLoadingSoftwareUpdates,
  setSoftwareUpdates,
  setEmptySoftwareUpdates,
  setSoftwareUpdatesErrors,
} from '@state/softwareUpdates';

export function* fetchSoftwareUpdates({ payload: hostID }) {
  yield put(startLoadingSoftwareUpdates());

  try {
    const response = yield call(getSoftwareUpdates, hostID);
    yield put(setSoftwareUpdates({ hostID, ...response.data }));
  } catch (error) {
    yield put(setEmptySoftwareUpdates({ hostID }));

    const errors = get(error, ['response', 'data'], []);
    yield put(setSoftwareUpdatesErrors(errors));
  }
}

export function* watchSoftwareUpdates() {
  yield takeEvery(FETCH_SOFTWARE_UPDATES, fetchSoftwareUpdates);
}
