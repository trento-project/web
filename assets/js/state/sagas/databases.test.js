import { recordSaga } from '@lib/test-utils';
import { databaseInstanceDeregistered } from '@state/sagas/databases';
import { removeDatabaseInstance } from '@state/databases';
import { removeDatabaseInstanceFromSapSystem } from '@state/sapSystems';
import { databaseInstanceFactory } from '@lib/test-utils/factories';
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
});
