import { recordSaga } from '@lib/test-utils';
import { hostDeregistered, hostDeregisterable } from '@state/sagas/hosts';
import { removeHost, setHostDeregisterable } from '@state/hosts';
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

  it('should mark the host as deregisterable', async () => {
    const { id, hostname } = hostFactory.build();
    const payload = { id, hostname };

    const dispatched = await recordSaga(hostDeregisterable, {
      payload,
    });

    expect(dispatched).toContainEqual(setHostDeregisterable(payload));
  });
});
