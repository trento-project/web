import { put, select, takeEvery } from 'redux-saga/effects';
import {
  SAP_SYSTEM_REGISTERED,
  SAP_SYSTEM_HEALTH_CHANGED,
  APPLICATION_INSTANCE_REGISTERED,
  APPLICATION_INSTANCE_MOVED,
  APPLICATION_INSTANCE_HEALTH_CHANGED,
  APPLICATION_INSTANCE_DEREGISTERED,
  SAP_SYSTEM_DEREGISTERED,
  SAP_SYSTEM_UPDATED,
  appendSapsystem,
  updateSapSystemHealth,
  appendApplicationInstance,
  removeApplicationInstance,
  updateApplicationInstanceHost,
  updateApplicationInstanceHealth,
  removeSAPSystem,
  updateSAPSystem,
} from '@state/sapSystems';
import { getSapSystem } from '@state/selectors';
import { appendEntryToLiveFeed } from '@state/liveFeed';
import { notify } from '@state/actions/notifications';

function* sapSystemRegistered({ payload }) {
  yield put(appendSapsystem(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.sid,
      message: 'New SAP System registered.',
    })
  );
  yield put(
    notify({
      text: `A new SAP System, ${payload.sid}, has been discovered.`,
      icon: 'ℹ️',
    })
  );
}

function* sapSystemHealthChanged({ payload }) {
  const sid = (yield select(getSapSystem(payload.id)))?.sid || 'unable to determine SID';

  yield put(updateSapSystemHealth(payload));
  yield put(
    appendEntryToLiveFeed({
      source: sid,
      message: `SAP System Health changed to ${payload.health}`,
    })
  );
  yield put(
    notify({
      text: `The SAP System ${sid} health is ${payload.health}!`,
      icon: 'ℹ️',
    })
  );
}

function* applicationInstanceRegistered({ payload }) {
  yield put(appendApplicationInstance(payload));
  yield put(
    appendEntryToLiveFeed({
      source: payload.sid,
      message: 'New Application instance registered.',
    })
  );
}

export function* applicationInstanceMoved({ payload: { sid, instance_number } }) {
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
    appendEntryToLiveFeed({
      source: payload.sid,
      message: 'Application instance deregistered.',
    })
  );
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

export function* sapSystemUpdated({ payload }) {
  yield put(updateSAPSystem(payload));
}

export function* watchSapSystem() {
  yield takeEvery(SAP_SYSTEM_REGISTERED, sapSystemRegistered);
  yield takeEvery(SAP_SYSTEM_HEALTH_CHANGED, sapSystemHealthChanged);
  yield takeEvery(APPLICATION_INSTANCE_REGISTERED, applicationInstanceRegistered);
  yield takeEvery(APPLICATION_INSTANCE_MOVED, applicationInstanceMoved);
  yield takeEvery(APPLICATION_INSTANCE_DEREGISTERED, applicationInstanceDeregistered);
  yield takeEvery(APPLICATION_INSTANCE_HEALTH_CHANGED, applicationInstanceHealthChanged);
  yield takeEvery(SAP_SYSTEM_DEREGISTERED, sapSystemDeregistered);
  yield takeEvery(SAP_SYSTEM_UPDATED, sapSystemUpdated);
}
