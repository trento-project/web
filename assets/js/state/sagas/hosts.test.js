import { recordSaga } from '@lib/test-utils';
import { hostDeregistered } from '@state/sagas/hosts';
import { removeHost } from '@state/hosts';

describe('Hosts sagas', () => {
  it('should trigger reducer to remove host', async () => {
    const id = 'test-host-id';

    const payload = {
      hostname: 'test-host',
      id: 'test-host-id',
    };

    const dispatched = await recordSaga(hostDeregistered, {
      type: 'HOST_DEREGISTERED',
      payload: {
        id,
        hostname: 'test-host',
      },
    });

    expect(dispatched).toContainEqual(removeHost(payload, id));
  });
});
