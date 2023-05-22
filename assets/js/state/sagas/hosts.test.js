import { recordSaga } from '@lib/test-utils';
import { hostDeregistered } from '@state/sagas/hosts';
import { removeHost } from '@state/hosts';
import { hostFactory } from '@lib/test-utils/factories';

describe('Hosts sagas', () => {
  it('should remove the host', async () => {
    const { id, hostname } = hostFactory.build();
    const payload = { id, hostname };

    const dispatched = await recordSaga(hostDeregistered, {
      payload,
    });

    expect(dispatched).toContainEqual(removeHost(payload));
  });
});
