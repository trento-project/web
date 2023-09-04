import MockAdapter from 'axios-mock-adapter';

import { recordSaga } from '@lib/test-utils';
import {
  applicationInstanceMoved,
  applicationInstanceAbsentAtChanged,
  applicationInstanceDeregistered,
  sapSystemDeregistered,
  sapSystemRestored,
  sapSystemUpdated,
  deregisterApplicationInstance,
} from '@state/sagas/sapSystems';
import {
  appendSapsystem,
  removeSAPSystem,
  upsertDatabaseInstancesToSapSystem,
  updateApplicationInstanceHost,
  upsertApplicationInstances,
  updateApplicationInstanceAbsentAt,
  removeApplicationInstance,
  updateSAPSystem,
  setApplicationInstanceDeregistering,
  unsetApplicationInstanceDeregistering,
} from '@state/sapSystems';
import { networkClient } from '@lib/network';
import { notify } from '@state/actions/notifications';
import {
  sapSystemFactory,
  sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories';
import { faker } from '@faker-js/faker';

const axiosMock = new MockAdapter(networkClient);

describe('SAP Systems sagas', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
  });

  it('should remove the SAP system', async () => {
    const { id, sid } = sapSystemFactory.build();

    const dispatched = await recordSaga(sapSystemDeregistered, {
      payload: { id, sid },
    });

    expect(dispatched).toContainEqual(removeSAPSystem({ id }));
  });

  it('should restore the SAP system', async () => {
    const sapSystem = sapSystemFactory.build();

    const dispatched = await recordSaga(sapSystemRestored, {
      payload: sapSystem,
    });

    expect(dispatched).toEqual([
      appendSapsystem(sapSystem),
      upsertDatabaseInstancesToSapSystem(sapSystem.database_instances),
      upsertApplicationInstances(sapSystem.application_instances),
      notify({
        text: `SAP System ${sapSystem.sid} has been restored.`,
        icon: 'ℹ️',
      }),
    ]);
  });

  it('should update the application instance host', async () => {
    const { sap_system_id, instance_number, old_host_id } =
      sapSystemApplicationInstanceFactory.build();
    const new_host_id = faker.datatype.uuid();

    const dispatched = await recordSaga(applicationInstanceMoved, {
      payload: { sap_system_id, instance_number, old_host_id, new_host_id },
    });

    expect(dispatched).toContainEqual(
      updateApplicationInstanceHost({
        sap_system_id,
        instance_number,
        old_host_id,
        new_host_id,
      })
    );
  });

  it('should update the absent_at field when the application instance is marked absent', async () => {
    const { sap_system_id, instance_number, host_id, sid } =
      sapSystemApplicationInstanceFactory.build();
    const absent_at = Date.now();

    const dispatched = await recordSaga(applicationInstanceAbsentAtChanged, {
      payload: { sap_system_id, instance_number, host_id, sid, absent_at },
    });

    expect(dispatched).toEqual([
      updateApplicationInstanceAbsentAt({
        sap_system_id,
        instance_number,
        host_id,
        sid,
        absent_at,
      }),
      notify({
        text: `The application instance ${sid} is now absent.`,
        icon: 'ℹ️',
      }),
    ]);
  });

  it('should update the absent_at field when the application instance is marked present', async () => {
    const { sap_system_id, instance_number, host_id, sid, absent_at } =
      sapSystemApplicationInstanceFactory.build();

    const dispatched = await recordSaga(applicationInstanceAbsentAtChanged, {
      payload: { sap_system_id, instance_number, host_id, sid, absent_at },
    });

    expect(dispatched).toEqual([
      updateApplicationInstanceAbsentAt({
        sap_system_id,
        instance_number,
        host_id,
        sid,
        absent_at,
      }),
      notify({
        text: `The application instance ${sid} is now present.`,
        icon: 'ℹ️',
      }),
    ]);
  });

  it('should remove the application instance', async () => {
    const { sap_system_id, host_id, instance_number } =
      sapSystemApplicationInstanceFactory.build();

    const dispatched = await recordSaga(applicationInstanceDeregistered, {
      payload: { sap_system_id, host_id, instance_number },
    });

    expect(dispatched).toContainEqual(
      removeApplicationInstance({ sap_system_id, host_id, instance_number })
    );
  });

  it('should update the SAP system', async () => {
    const { id, ensa_version } = sapSystemFactory.build();

    const dispatched = await recordSaga(sapSystemUpdated, {
      payload: { id, ensa_version },
    });

    expect(dispatched).toContainEqual(updateSAPSystem({ id, ensa_version }));
  });

  it('should deregister the application instance', async () => {
    const instance = sapSystemApplicationInstanceFactory.build();
    const { sap_system_id, host_id, instance_number } = instance;

    axiosMock
      .onDelete(
        `/sap_systems/${sap_system_id}/hosts/${host_id}/instances/${instance_number}`
      )
      .reply(204, {});

    const dispatched = await recordSaga(deregisterApplicationInstance, {
      payload: instance,
    });

    expect(dispatched).toEqual([
      setApplicationInstanceDeregistering(instance),
      unsetApplicationInstanceDeregistering(instance),
    ]);
  });

  it('should notify an error on application instance deregistration request failure', async () => {
    const instance = sapSystemApplicationInstanceFactory.build();
    const { sid, sap_system_id, host_id, instance_number } = instance;

    axiosMock
      .onDelete(
        `/sap_systems/${sap_system_id}/hosts/${host_id}/instances/${instance_number}`
      )
      .reply(404, {});

    const dispatched = await recordSaga(deregisterApplicationInstance, {
      payload: instance,
    });

    expect(dispatched).toEqual([
      setApplicationInstanceDeregistering(instance),
      notify({
        text: `Error deregistering instance ${instance_number} from ${sid}.`,
        icon: '❌',
      }),
      unsetApplicationInstanceDeregistering(instance),
    ]);
  });
});
