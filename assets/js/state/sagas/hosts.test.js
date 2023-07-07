import { recordSaga } from '@lib/test-utils';
import {
  markDeregisterableHosts,
  matchHost,
  checkHostDeregisterable,
  hostDeregistered,
} from '@state/sagas/hosts';
import {
  cancelCheckHostIsDeregisterable,
  setHostListDeregisterable,
  removeHost,
} from '@state/hosts';
import { hostFactory } from '@lib/test-utils/factories';

describe('Hosts sagas', () => {
  it('should mark hosts as deregisterable', async () => {
    const passingHost = hostFactory.build({ heartbeat: 'passing' });
    const criticalHost = hostFactory.build({ heartbeat: 'critical' });
    const unknownHost = hostFactory.build({ heartbeat: 'unknown' });

    const dispatched = await recordSaga(markDeregisterableHosts, [
      passingHost,
      criticalHost,
      unknownHost,
    ]);

    expect(dispatched).toContainEqual(
      setHostListDeregisterable([criticalHost, unknownHost])
    );
  });

  it('should only cancel for the correct host', async () => {
    const matchedHost = hostFactory.build();
    const otherHosts = hostFactory.buildList(2);

    const actions = [...otherHosts, matchedHost].map((host) =>
      cancelCheckHostIsDeregisterable(host)
    );

    const match = matchHost(matchedHost.id);

    expect(actions.map((action) => match(action))).toStrictEqual(
      new Array(otherHosts.length).fill(false).concat(true)
    );
  });

  it('should mark a host as deregisterable', async () => {
    const { id } = hostFactory.build();

    const dispatched = await recordSaga(checkHostDeregisterable, {
      payload: { id, debounce: 0 },
    });

    expect(dispatched).toContainEqual(setHostListDeregisterable([{ id }]));
  });

  it('should remove the host', async () => {
    const { id, hostname } = hostFactory.build();
    const payload = { id, hostname };

    const dispatched = await recordSaga(hostDeregistered, {
      payload,
    });

    expect(dispatched).toContainEqual(removeHost(payload));
  });
});
