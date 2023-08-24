import { call, put, select, takeEvery } from 'redux-saga/effects';
import { del } from '@lib/network';

import {
  SAP_SYSTEM_REGISTERED,
  SAP_SYSTEM_HEALTH_CHANGED,
  APPLICATION_INSTANCE_REGISTERED,
  APPLICATION_INSTANCE_MOVED,
  APPLICATION_INSTANCE_HEALTH_CHANGED,
  APPLICATION_INSTANCE_DEREGISTERED,
  SAP_SYSTEM_DEREGISTERED,
  SAP_SYSTEM_RESTORED,
  SAP_SYSTEM_UPDATED,
  DEREGISTER_APPLICATION_INSTANCE,
  appendSapsystem,
  updateSapSystemHealth,
  upsertDatabaseInstancesToSapSystem,
  upsertApplicationInstances,
  removeApplicationInstance,
  updateApplicationInstanceHost,
  updateApplicationInstanceHealth,
  removeSAPSystem,
  updateSAPSystem,
  setApplicationInstanceDeregistering,
  setApplicationInstanceNotDeregistering,
} from '@state/sapSystems';
import { getSapSystem } from '@state/selectors/sapSystem';
import { notify } from '@state/actions/notifications';

function* sapSystemRegistered({ payload }) {
  yield put(appendSapsystem(payload));
  yield put(
    notify({
      text: `A new SAP System, ${payload.sid}, has been discovered.`,
      icon: 'ℹ️',
    })
  );
}

function* sapSystemHealthChanged({ payload }) {
  const sid =
    (yield select(getSapSystem(payload.id)))?.sid || 'unable to determine SID';

  yield put(updateSapSystemHealth(payload));
  yield put(
    notify({
      text: `The SAP System ${sid} health is ${payload.health}!`,
      icon: 'ℹ️',
    })
  );
}

function* applicationInstanceRegistered({ payload }) {
  yield put(upsertApplicationInstances([payload]));
}

export function* applicationInstanceMoved({ payload }) {
  const { sid, instance_number } = payload;
  yield put(updateApplicationInstanceHost(payload));
  yield put(
    notify({
      text: `The application instance ${instance_number} in ${sid} has been moved.`,
      icon: 'ℹ️',
    })
  );
}

export function* applicationInstanceDeregistered({ payload }) {
  yield put(removeApplicationInstance(payload));
  yield put(
    notify({
      text: `The application instance ${payload.instance_number} has been deregistered from ${payload.sid}.`,
      icon: 'ℹ️',
    })
  );
}

function* applicationInstanceHealthChanged({ payload }) {
  yield put(updateApplicationInstanceHealth(payload));
}

export function* sapSystemDeregistered({ payload: { id, sid } }) {
  yield put(removeSAPSystem({ id }));
  yield put(
    notify({
      text: `The SAP System ${sid} has been deregistered.`,
      icon: 'ℹ️',
    })
  );
}

export function* sapSystemRestored({ payload }) {
  yield put(appendSapsystem(payload));

  const {
    database_instances: databaseInstances,
    application_instances: applicationInstances,
  } = payload;

  yield put(upsertDatabaseInstancesToSapSystem(databaseInstances));
  yield put(upsertApplicationInstances(applicationInstances));

  yield put(
    notify({
      text: `SAP System ${payload.sid} has been restored.`,
      icon: 'ℹ️',
    })
  );
}

export function* sapSystemUpdated({ payload }) {
  yield put(updateSAPSystem(payload));
}

export function* deregisterApplicationInstance({
  payload,
  payload: { sid, sap_system_id, host_id, instance_number },
}) {
  yield put(setApplicationInstanceDeregistering(payload));
  try {
    yield call(
      del,
      `/sap_systems/${sap_system_id}/hosts/${host_id}/instances/${instance_number}`
    );
  } catch (error) {
    yield put(
      notify({
        text: `Error deregistering instance ${instance_number} from ${sid}.`,
        icon: '❌',
      })
    );
  } finally {
    yield put(setApplicationInstanceNotDeregistering(payload));
  }
}

export function* watchSapSystem() {
  yield takeEvery(SAP_SYSTEM_REGISTERED, sapSystemRegistered);
  yield takeEvery(SAP_SYSTEM_HEALTH_CHANGED, sapSystemHealthChanged);
  yield takeEvery(
    APPLICATION_INSTANCE_REGISTERED,
    applicationInstanceRegistered
  );
  yield takeEvery(APPLICATION_INSTANCE_MOVED, applicationInstanceMoved);
  yield takeEvery(
    APPLICATION_INSTANCE_DEREGISTERED,
    applicationInstanceDeregistered
  );
  yield takeEvery(
    APPLICATION_INSTANCE_HEALTH_CHANGED,
    applicationInstanceHealthChanged
  );
  yield takeEvery(SAP_SYSTEM_DEREGISTERED, sapSystemDeregistered);
  yield takeEvery(SAP_SYSTEM_RESTORED, sapSystemRestored);
  yield takeEvery(SAP_SYSTEM_UPDATED, sapSystemUpdated);
  yield takeEvery(
    DEREGISTER_APPLICATION_INSTANCE,
    deregisterApplicationInstance
  );
}
