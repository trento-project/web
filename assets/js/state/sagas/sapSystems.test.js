import { recordSaga } from '@lib/test-utils';
import { sapSystemDeregistered } from '@state/sagas/sapSystems';
import { removeSAPSystem } from '@state/sapSystems';
import { SAP_SYSTEM_DEREGISTERED } from '@state/actions/sapSystem';
import { sapSystemFactory } from '@lib/test-utils/factories';

describe('SAP Systems sagas', () => {
  it('should trigger reducer to remove a SAP system', async () => {
    const { id, sid } = sapSystemFactory.build();
    const payload = { id, sid };

    const dispatched = await recordSaga(sapSystemDeregistered, {
      type: SAP_SYSTEM_DEREGISTERED,
      payload,
    });

    expect(dispatched).toContainEqual(removeSAPSystem(payload));
  });
});
