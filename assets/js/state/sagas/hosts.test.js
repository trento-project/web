import MockAdapter from 'axios-mock-adapter';

import { recordSaga } from '@lib/test-utils';
import {
  markDeregisterableHosts,
  matchHost,
  checkHostDeregisterable,
  hostDeregistered,
  deregisterHost,
} from '@state/sagas/hosts';

import {
  cancelCheckHostIsDeregisterable,
  setHostListDeregisterable,
  removeHost,
  setHostDeregistering,
  setHostNotDeregistering,
} from '@state/hosts';

import { networkClient } from '@lib/network';
import { notify } from '@state/actions/notifications';
import { hostFactory } from '@lib/test-utils/factories';

const axiosMock = new MockAdapter(networkClient);

describe('Hosts sagas', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
  });

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
    const otherHost = hostFactory.build();

    const match = matchHost(matchedHost.id);

    expect(match(cancelCheckHostIsDeregisterable(matchedHost))).toBeTruthy();
    expect(match(cancelCheckHostIsDeregisterable(otherHost))).toBeFalsy();
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

  it('should send host deregister request', async () => {
    const { id, hostname } = hostFactory.build();
    const payload = { id, hostname, navigate: () => {} };

    axiosMock.onDelete(`/hosts/${id}`).reply(204, {});

    const dispatched = await recordSaga(deregisterHost, { payload });

    expect(dispatched).toEqual([
      setHostDeregistering(payload),
      setHostNotDeregistering(payload),
    ]);
  });

  it('should notify error on host deregistration request', async () => {
    const { id, hostname } = hostFactory.build();
    const payload = { id, hostname, navigate: () => {} };

    axiosMock.onDelete(`/hosts/${id}`).reply(404, {});

    const dispatched = await recordSaga(deregisterHost, { payload });

    expect(dispatched).toEqual([
      setHostDeregistering(payload),
      notify({
        text: `Error deregistering host ${hostname}.`,
        icon: '❌',
      }),
      setHostNotDeregistering(payload),
    ]);
  });
});
