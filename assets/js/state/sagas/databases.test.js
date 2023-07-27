import { recordSaga } from '@lib/test-utils';
import {
  databaseDeregistered,
  databaseInstanceDeregistered,
  databaseRestored,
} from '@state/sagas/databases';
import {
  removeDatabase,
  removeDatabaseInstance,
  appendDatabase,
} from '@state/databases';
import { removeDatabaseInstanceFromSapSystem } from '@state/sapSystems';
import {
  databaseFactory,
  databaseInstanceFactory,
} from '@lib/test-utils/factories';
import { notify } from '@state/actions/notifications';

describe('SAP Systems sagas', () => {
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
      notify({
        text: `The database ${database.sid} has been restored.`,
        icon: 'ℹ️',
      }),
    ]);
  });
});
