import { recordSaga } from '@lib/test-utils';
import { sapSystemDeregistered } from '@state/sagas/sapSystems';
import { removeSAPSystem } from '@state/sapSystems';

describe('SAP Systems sagas', () => {
  it('should trigger reducer to remove a SAP system', async () => {
    const payload = {
      sid: 'NWD',
      id: 'test-system-id',
    };

    const dispatched = await recordSaga(sapSystemDeregistered, {
      type: 'SAP_SYSTEM_DEREGISTERED',
      payload,
    });

    expect(dispatched).toContainEqual(removeSAPSystem(payload));
  });
});
