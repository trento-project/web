import { put, select, takeEvery } from 'redux-saga/effects';
import {
  DATABASE_REGISTERED,
  DATABASE_HEALTH_CHANGED,
  DATABASE_INSTANCE_REGISTERED,
  DATABASE_INSTANCE_HEALTH_CHANGED,
  DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED,
  appendDatabase,
  appendDatabaseInstance,
  updateDatabaseHealth,
  updateDatabaseInstanceHealth,
  updateDatabaseInstanceSystemReplication,
} from '@state/databases';

import {
  appendDatabaseInstanceToSapSystem,
  updateSAPSystemDatabaseInstanceHealth,
  updateSAPSystemDatabaseInstanceSystemReplication,
} from '@state/sapSystems';

import { getDatabase } from '@state/selectors';
import { appendEntryToLiveFeed } from '@state/liveFeed';
import { notify } from '@state/actions/notifications';

function* databaseRegistered({ payload }) {
  yield put(appendDatabase(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.sid,
      message: 'New Database registered.',
    })
  );
  yield put(
    notify({
      text: `A new Database, ${payload.sid}, has been discovered.`,
      icon: 'ℹ️',
    })
  );
}

function* databaseHealthChanged({ payload }) {
  const sid =
    (yield select(getDatabase(payload.id)))?.sid || 'unable to determine SID';

  yield put(updateDatabaseHealth(payload));
  yield put(
    appendEntryToLiveFeed({
      source: sid,
      message: `Database Health changed to ${payload.health}`,
    })
  );
  yield put(
    notify({
      text: `The Database ${sid} health is ${payload.health}!`,
      icon: 'ℹ️',
    })
  );
}

function* databaseInstanceRegistered({ payload }) {
  yield put(appendDatabaseInstance(payload));
  yield put(appendDatabaseInstanceToSapSystem(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.sid,
      message: 'New Database instance registered.',
    })
  );
  yield put(
    notify({
      text: `A new Database instance, ${payload.sid}, has been discovered.`,
      icon: 'ℹ️',
    })
  );
}

function* databaseInstanceHealthChanged({ payload }) {
  yield put(updateDatabaseInstanceHealth(payload));
  yield put(updateSAPSystemDatabaseInstanceHealth(payload));
}

function* databaseInstanceSystemReplicationChanged({ payload }) {
  yield put(updateDatabaseInstanceSystemReplication(payload));
  yield put(updateSAPSystemDatabaseInstanceSystemReplication(payload));
}

export function* watchDatabase() {
  yield takeEvery(DATABASE_REGISTERED, databaseRegistered);
  yield takeEvery(DATABASE_HEALTH_CHANGED, databaseHealthChanged);
  yield takeEvery(DATABASE_INSTANCE_REGISTERED, databaseInstanceRegistered);
  yield takeEvery(
    DATABASE_INSTANCE_HEALTH_CHANGED,
    databaseInstanceHealthChanged
  );
  yield takeEvery(
    DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED,
    databaseInstanceSystemReplicationChanged
  );
}
