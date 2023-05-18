import { recordSaga } from '@lib/test-utils';
import { hostDeregistered } from '@state/sagas/hosts';
import { removeHost } from '@state/hosts';
import { HOST_DEREGISTERED } from '@state/actions/host';
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
