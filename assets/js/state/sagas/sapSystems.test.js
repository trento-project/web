import { recordSaga } from '@lib/test-utils';
import { sapSystemDeregistered } from '@state/sagas/sapSystems';
import { SAP_SYSTEM_DEREGISTERED, removeSAPSystem } from '@state/sapSystems';
import { sapSystemFactory } from '@lib/test-utils/factories';

describe('SAP Systems sagas', () => {
  it('should remove the SAP system', async () => {
    const { id, sid } = sapSystemFactory.build();

    const dispatched = await recordSaga(sapSystemDeregistered, {
      type: SAP_SYSTEM_DEREGISTERED,
      payload: { sap_system_id: id, sid },
    });

    expect(dispatched).toContainEqual(removeSAPSystem({ id }));
  });
});
