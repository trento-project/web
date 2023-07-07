import { runSaga } from 'redux-saga';
import { recordSaga } from '@lib/test-utils';
import {
  markDeregisterableHosts,
  hostDeregisterable,
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

  it('should mark a host as deregisterable', async () => {
    const host = hostFactory.build();

    const dispatched = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      hostDeregisterable,
      0,
      host
    ).toPromise();

    expect(dispatched[0]).toEqual(setHostListDeregisterable([host]));
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

  it('should correctly mark hosts as deregisterable', async () => {
    const passingHost = hostFactory.build({ heartbeat: 'passing' });
    const criticalHost = hostFactory.build({ heartbeat: 'critical' });
    const unknownHost = hostFactory.build({ heartbeat: 'unknown' });
    const hosts = [passingHost, criticalHost, unknownHost];

    const dispatched = [];

    const promises = hosts.map((host) =>
      runSaga(
        { dispatch: (action) => dispatched.push(action) },
        checkHostDeregisterable,
        0,
        { payload: host }
      ).toPromise()
    );

    await Promise.all(promises);

    expect(dispatched).toEqual(
      hosts.map((host) => setHostListDeregisterable([host]))
    );
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
