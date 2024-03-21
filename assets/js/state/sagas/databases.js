import { call, put, select, takeEvery } from 'redux-saga/effects';
import { del } from '@lib/network';

import {
  DATABASE_REGISTERED,
  DATABASE_DEREGISTERED,
  DATABASE_RESTORED,
  DATABASE_HEALTH_CHANGED,
  DATABASE_INSTANCE_REGISTERED,
  DATABASE_INSTANCE_ABSENT_AT_CHANGED,
  DATABASE_INSTANCE_DEREGISTERED,
  DATABASE_INSTANCE_HEALTH_CHANGED,
  DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED,
  DEREGISTER_DATABASE_INSTANCE,
  appendDatabase,
  upsertDatabaseInstances,
  updateDatabaseHealth,
  updateDatabaseInstanceHealth,
  updateDatabaseInstanceSystemReplication,
  updateDatabaseInstanceAbsentAt,
  removeDatabase,
  removeDatabaseInstance,
  setDatabaseInstanceDeregistering,
  unsetDatabaseInstanceDeregistering,
} from '@state/databases';

import { getDatabase } from '@state/selectors/sapSystem';
import { notify } from '@state/notifications';

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
  yield put(
    notify({
      text: `The database ${payload.sid} has been restored.`,
      icon: 'ℹ️',
    })
  );
}

export function* databaseInstanceDeregistered({ payload }) {
  yield put(removeDatabaseInstance(payload));
  yield put(
    notify({
      text: `The database instance ${payload.instance_number} has been deregistered from ${payload.sid}.`,
      icon: 'ℹ️',
    })
  );
}

function* databaseInstanceHealthChanged({ payload }) {
  yield put(updateDatabaseInstanceHealth(payload));
}

function* databaseInstanceSystemReplicationChanged({ payload }) {
  yield put(updateDatabaseInstanceSystemReplication(payload));
}

export function* databaseInstanceAbsentAtChanged({ payload }) {
  yield put(updateDatabaseInstanceAbsentAt(payload));
  const { sid, absent_at, instance_number } = payload;
  yield put(
    notify({
      text: `The database instance ${instance_number} from ${sid} is ${
        absent_at ? 'absent' : 'present again'
      }`,
      icon: 'ℹ️',
    })
  );
}

export function* deregisterDatabaseInstance({
  payload,
  payload: { sid, database_id, host_id, instance_number },
}) {
  yield put(setDatabaseInstanceDeregistering(payload));
  try {
    yield call(
      del,
      `/databases/${database_id}/hosts/${host_id}/instances/${instance_number}`
    );
  } catch (error) {
    yield put(
      notify({
        text: `Error deregistering instance ${instance_number} from ${sid}.`,
        icon: '❌',
      })
    );
  } finally {
    yield put(unsetDatabaseInstanceDeregistering(payload));
  }
}

export function* watchDatabaseEvents() {
  yield takeEvery(DATABASE_REGISTERED, databaseRegistered);
  yield takeEvery(DATABASE_DEREGISTERED, databaseDeregistered);
  yield takeEvery(DATABASE_RESTORED, databaseRestored);
  yield takeEvery(DATABASE_HEALTH_CHANGED, databaseHealthChanged);
  yield takeEvery(DATABASE_INSTANCE_REGISTERED, databaseInstanceRegistered);
  yield takeEvery(
    DATABASE_INSTANCE_ABSENT_AT_CHANGED,
    databaseInstanceAbsentAtChanged
  );
  yield takeEvery(DATABASE_INSTANCE_DEREGISTERED, databaseInstanceDeregistered);
  yield takeEvery(
    DATABASE_INSTANCE_HEALTH_CHANGED,
    databaseInstanceHealthChanged
  );
  yield takeEvery(
    DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED,
    databaseInstanceSystemReplicationChanged
  );
  yield takeEvery(DEREGISTER_DATABASE_INSTANCE, deregisterDatabaseInstance);
}
