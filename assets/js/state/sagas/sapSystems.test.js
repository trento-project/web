import { recordSaga } from '@lib/test-utils';
import { sapSystemDeregistered } from '@state/sagas/sapSystems';
import { removeSAPSystem } from '@state/sapSystems';
import { sapSystemFactory } from '@lib/test-utils/factories';

describe('SAP Systems sagas', () => {
  it('should remove the SAP system', async () => {
    const { id, sid } = sapSystemFactory.build();

    const dispatched = await recordSaga(sapSystemDeregistered, {
      payload: { id, sid },
    });

    expect(dispatched).toContainEqual(removeSAPSystem({ id }));
  });
});
