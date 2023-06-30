import { recordSaga } from '@lib/test-utils';
import {
  applicationInstanceMoved,
  applicationInstanceDeregistered,
  sapSystemDeregistered,
  sapSystemUpdated,
} from '@state/sagas/sapSystems';
import {
  removeSAPSystem,
  updateApplicationInstanceHost,
  removeApplicationInstance,
  updateSAPSystem,
} from '@state/sapSystems';
import {
  sapSystemFactory,
  sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories';
import { faker } from '@faker-js/faker';

describe('SAP Systems sagas', () => {
  it('should remove the SAP system', async () => {
    const { id, sid } = sapSystemFactory.build();

    const dispatched = await recordSaga(sapSystemDeregistered, {
      payload: { id, sid },
    });

    expect(dispatched).toContainEqual(removeSAPSystem({ id }));
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
});
