import { put, select, takeEvery } from 'redux-saga/effects';
import {
  DATABASE_REGISTERED,
  DATABASE_DEREGISTERED,
  DATABASE_RESTORED,
  DATABASE_HEALTH_CHANGED,
  DATABASE_INSTANCE_REGISTERED,
  DATABASE_INSTANCE_DEREGISTERED,
  DATABASE_INSTANCE_HEALTH_CHANGED,
  DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED,
  appendDatabase,
  upsertDatabaseInstances,
  updateDatabaseHealth,
  updateDatabaseInstanceHealth,
  updateDatabaseInstanceSystemReplication,
  removeDatabase,
  removeDatabaseInstance,
} from '@state/databases';

import {
  upsertDatabaseInstancesToSapSystem,
  removeDatabaseInstanceFromSapSystem,
  updateSAPSystemDatabaseInstanceHealth,
  updateSAPSystemDatabaseInstanceSystemReplication,
} from '@state/sapSystems';

import { getDatabase } from '@state/selectors/sapSystem';
import { notify } from '@state/actions/notifications';

function* databaseRegistered({ payload }) {
  yield put(appendDatabase(payload));
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
    notify({
      text: `The Database ${sid} health is ${payload.health}!`,
      icon: 'ℹ️',
    })
  );
}

function* databaseInstanceRegistered({ payload }) {
  yield put(upsertDatabaseInstances([payload]));
  yield put(upsertDatabaseInstancesToSapSystem([payload]));
  yield put(
    notify({
      text: `A new Database instance, ${payload.sid}, has been discovered.`,
      icon: 'ℹ️',
    })
  );
}

export function* databaseDeregistered({ payload }) {
  yield put(removeDatabase(payload));
  yield put(
    notify({
      text: `The database ${payload.sid} has been deregistered.`,
      icon: 'ℹ️',
    })
  );
}

export function* databaseRestored({ payload }) {
  yield put(appendDatabase(payload));
  yield put(upsertDatabaseInstances(payload.database_instances));
  yield put(upsertDatabaseInstancesToSapSystem(payload.database_instances));
  yield put(
    notify({
      text: `The database ${payload.sid} has been restored.`,
      icon: 'ℹ️',
    })
  );
}

export function* databaseInstanceDeregistered({ payload }) {
  yield put(removeDatabaseInstance(payload));
  yield put(removeDatabaseInstanceFromSapSystem(payload));
  yield put(
    notify({
      text: `The database instance ${payload.instance_number} has been deregistered from ${payload.sid}.`,
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
  yield takeEvery(DATABASE_DEREGISTERED, databaseDeregistered);
  yield takeEvery(DATABASE_RESTORED, databaseRestored);
  yield takeEvery(DATABASE_HEALTH_CHANGED, databaseHealthChanged);
  yield takeEvery(DATABASE_INSTANCE_REGISTERED, databaseInstanceRegistered);
  yield takeEvery(DATABASE_INSTANCE_DEREGISTERED, databaseInstanceDeregistered);
  yield takeEvery(
    DATABASE_INSTANCE_HEALTH_CHANGED,
    databaseInstanceHealthChanged
  );
  yield takeEvery(
    DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED,
    databaseInstanceSystemReplicationChanged
  );
}
