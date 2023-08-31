import MockAdapter from 'axios-mock-adapter';

import { recordSaga } from '@lib/test-utils';
import {
  databaseInstanceAbsentAtChanged,
  databaseDeregistered,
  databaseInstanceDeregistered,
  databaseRestored,
  deregisterDatabaseInstance,
} from '@state/sagas/databases';
import {
  upsertDatabaseInstances,
  removeDatabase,
  removeDatabaseInstance,
  appendDatabase,
  updateDatabaseInstanceAbsentAt,
  setDatabaseInstanceDeregistering,
  unsetDatabaseInstanceDeregistering,
} from '@state/databases';
import {
  removeDatabaseInstanceFromSapSystem,
  upsertDatabaseInstancesToSapSystem,
  setDatabaseInstanceDeregisteringToSAPSystem,
  unsetDatabaseInstanceDeregisteringToSAPSystem,
} from '@state/sapSystems';
import {
  databaseFactory,
  databaseInstanceFactory,
} from '@lib/test-utils/factories';
import { networkClient } from '@lib/network';
import { notify } from '@state/actions/notifications';

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

  it('should update the absent_at field when the database instance is marked absent', async () => {
    const { sap_system_id, instance_number, host_id, sid } =
      databaseInstanceFactory.build();
    const absent_at = Date.now();

    const dispatched = await recordSaga(databaseInstanceAbsentAtChanged, {
      payload: { sap_system_id, instance_number, host_id, sid, absent_at },
    });

    expect(dispatched).toEqual([
      updateDatabaseInstanceAbsentAt({
        sap_system_id,
        instance_number,
        host_id,
        sid,
        absent_at,
      }),
      notify({
        text: `The database instance ${sid} is now absent.`,
        icon: 'ℹ️',
      }),
    ]);
  });

  it('should update the absent_at field when the database instance is marked present', async () => {
    const { sap_system_id, instance_number, host_id, sid, absent_at } =
      databaseInstanceFactory.build();

    const dispatched = await recordSaga(databaseInstanceAbsentAtChanged, {
      payload: { sap_system_id, instance_number, host_id, sid, absent_at },
    });

    expect(dispatched).toEqual([
      updateDatabaseInstanceAbsentAt({
        sap_system_id,
        instance_number,
        host_id,
        sid,
        absent_at,
      }),
      notify({
        text: `The database instance ${sid} is now present.`,
        icon: 'ℹ️',
      }),
    ]);
  });

  it('should remove the database instance', async () => {
    const { sap_system_id, host_id, instance_number, sid } =
      databaseInstanceFactory.build();

    const dispatched = await recordSaga(databaseInstanceDeregistered, {
      payload: { sap_system_id, host_id, instance_number, sid },
    });

    expect(dispatched).toContainEqual(
      removeDatabaseInstanceFromSapSystem({
        sap_system_id,
        host_id,
        instance_number,
        sid,
      })
    );
    expect(dispatched).toContainEqual(
      removeDatabaseInstance({ sap_system_id, host_id, instance_number, sid })
    );
    expect(dispatched).toContainEqual(
      notify({
        text: `The database instance ${instance_number} has been deregistered from ${sid}.`,
        icon: 'ℹ️',
      })
    );
  });

  it('should remove the database', async () => {
    const { id, sid } = databaseFactory.build();

    const dispatched = await recordSaga(databaseDeregistered, {
      payload: { id, sid },
    });

    expect(dispatched).toContainEqual(removeDatabase({ id, sid }));

    expect(dispatched).toContainEqual(
      notify({
        text: `The database ${sid} has been deregistered.`,
        icon: 'ℹ️',
      })
    );
  });

  it('should restore the database', async () => {
    const database = databaseFactory.build();

    const dispatched = await recordSaga(databaseRestored, {
      payload: database,
    });

    expect(dispatched).toEqual([
      appendDatabase(database),
      upsertDatabaseInstances(database.database_instances),
      upsertDatabaseInstancesToSapSystem(database.database_instances),
      notify({
        text: `The database ${database.sid} has been restored.`,
        icon: 'ℹ️',
      }),
    ]);
  });

  it('should deregister the database instance', async () => {
    const instance = databaseInstanceFactory.build();
    const { sap_system_id, host_id, instance_number } = instance;

    axiosMock
      .onDelete(
        `/databases/${sap_system_id}/hosts/${host_id}/instances/${instance_number}`
      )
      .reply(204, {});

    const dispatched = await recordSaga(deregisterDatabaseInstance, {
      payload: instance,
    });

    expect(dispatched).toEqual([
      setDatabaseInstanceDeregistering(instance),
      setDatabaseInstanceDeregisteringToSAPSystem(instance),
      unsetDatabaseInstanceDeregistering(instance),
      unsetDatabaseInstanceDeregisteringToSAPSystem(instance),
    ]);
  });

  it('should notify an error on database instance deregistration request failure', async () => {
    const instance = databaseInstanceFactory.build();
    const { sid, sap_system_id, host_id, instance_number } = instance;

    axiosMock
      .onDelete(
        `/databases/${sap_system_id}/hosts/${host_id}/instances/${instance_number}`
      )
      .reply(404, {});

    const dispatched = await recordSaga(deregisterDatabaseInstance, {
      payload: instance,
    });

    expect(dispatched).toEqual([
      setDatabaseInstanceDeregistering(instance),
      setDatabaseInstanceDeregisteringToSAPSystem(instance),
      notify({
        text: `Error deregistering instance ${instance_number} from ${sid}.`,
        icon: '❌',
      }),
      unsetDatabaseInstanceDeregistering(instance),
      unsetDatabaseInstanceDeregisteringToSAPSystem(instance),
    ]);
  });
});
