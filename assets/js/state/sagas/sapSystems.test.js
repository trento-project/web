import { recordSaga } from '@lib/test-utils';
import {
  sapSystemDeregistered,
  sapSystemUpdated,
} from '@state/sagas/sapSystems';
import { removeSAPSystem, updateSAPSystem } from '@state/sapSystems';
import { sapSystemFactory } from '@lib/test-utils/factories';

describe('SAP Systems sagas', () => {
  it('should remove the SAP system', async () => {
    const { id, sid } = sapSystemFactory.build();

    const dispatched = await recordSaga(sapSystemDeregistered, {
      payload: { id, sid },
    });

    expect(dispatched).toContainEqual(removeSAPSystem({ id }));
  });

  it('should updated the SAP system', async () => {
    const { id, ensa_version } = sapSystemFactory.build();

    const dispatched = await recordSaga(sapSystemUpdated, {
      payload: { id, ensa_version },
    });

    expect(dispatched).toContainEqual(updateSAPSystem({ id, ensa_version }));
  });
});
