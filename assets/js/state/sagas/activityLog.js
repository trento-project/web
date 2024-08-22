import { put, takeEvery  } from 'redux-saga/effects';
import {
  setUsers,
  AL_USERS_PUSHED
} from '@state/activityLog';

export function* alUsersUpdate({payload: {users}}) {
  yield put(setUsers({users}))
}

export function* watchAlActions() {
  yield takeEvery(AL_USERS_PUSHED, alUsersUpdate);
  
}
