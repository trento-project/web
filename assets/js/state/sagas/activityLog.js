import { put, takeEvery } from 'redux-saga/effects';
import { setUsers, AL_USERS_PUSHED } from '@state/activityLog';

export function* activityLogUsersUpdate({ payload: { users } }) {
  yield put(setUsers({ users }));
}

export function* watchActivityLogActions() {
  yield takeEvery(AL_USERS_PUSHED, activityLogUsersUpdate);
}
