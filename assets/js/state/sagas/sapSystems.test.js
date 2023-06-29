import { recordSaga } from '@lib/test-utils';
import {
  applicationInstanceDeregistered,
  sapSystemDeregistered,
  sapSystemUpdated,
} from '@state/sagas/sapSystems';
import {
  removeSAPSystem,
  removeApplicationInstance,
  updateSAPSystem,
} from '@state/sapSystems';
import {
  sapSystemFactory,
  sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories';

describe('SAP Systems sagas', () => {
  it('should remove the SAP system', async () => {
    const { id, sid } = sapSystemFactory.build();

    const dispatched = await recordSaga(sapSystemDeregistered, {
      payload: { id, sid },
    });

    expect(dispatched).toContainEqual(removeSAPSystem({ id }));
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

  it('should updated the SAP system', async () => {
    const { id, ensa_version } = sapSystemFactory.build();

    const dispatched = await recordSaga(sapSystemUpdated, {
      payload: { id, ensa_version },
    });

    expect(dispatched).toContainEqual(updateSAPSystem({ id, ensa_version }));
  });
});
