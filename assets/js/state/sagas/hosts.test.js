import { recordSaga } from '@lib/test-utils';
import { hostDeregistered } from '@state/sagas/hosts';
import { HOST_DEREGISTERED, removeHost } from '@state/hosts';
import { hostFactory } from '@lib/test-utils/factories';

describe('Hosts sagas', () => {
  it('should remove the host', async () => {
    const { id, hostname } = hostFactory.build();
    const payload = { id, hostname };

    const dispatched = await recordSaga(hostDeregistered, {
      type: HOST_DEREGISTERED,
      payload,
    });

    expect(dispatched).toContainEqual(removeHost(payload));
  });
});
