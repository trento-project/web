import MockAdapter from 'axios-mock-adapter';

import { recordSaga } from '@lib/test-utils';
import {
  markDeregisterableHosts,
  matchHost,
  checkHostDeregisterable,
  hostDeregistered,
  deregisterHost,
  hostRestored,
  hostHealthChanged,
  saptuneStatusUpdated,
  hostSoftwareUpdatesDiscoveryCompleted,
} from '@state/sagas/hosts';

import {
  cancelCheckHostIsDeregisterable,
  setHostListDeregisterable,
  removeHost,
  setHostDeregistering,
  unsetHostDeregistering,
  appendHost,
  updateHostHealth,
  updateSaptuneStatus,
} from '@state/hosts';

import { fetchSoftwareUpdatesSettings } from '@state/softwareUpdatesSettings';
import { fetchSoftwareUpdates } from '@state/softwareUpdates';

import { networkClient } from '@lib/network';
import { notify } from '@state/notifications';
import { hostFactory } from '@lib/test-utils/factories';
import { softwareUpdatesSettingsFactory } from '@lib/test-utils/factories/softwareUpdatesSettings';

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
    const payload = { id, hostname };
    const mockNavigate = jest.fn();
    const router = {
      navigate: mockNavigate,
    };
    const context = { router };

    axiosMock.onDelete(`/hosts/${id}`).reply(204, {});

    const dispatched = await recordSaga(
      deregisterHost,
      { payload },
      {},
      context
    );

    expect(dispatched).toEqual([
      setHostDeregistering(payload),
      unsetHostDeregistering(payload),
    ]);

    expect(mockNavigate).toHaveBeenCalledWith('/hosts');
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
      unsetHostDeregistering(payload),
    ]);
  });

  it('should restore a host', async () => {
    const host = hostFactory.build();

    const dispatched = await recordSaga(hostRestored, { payload: host });

    expect(dispatched).toEqual([
      appendHost(host),
      notify({
        text: `Host ${host.hostname} has been restored.`,
        icon: 'ℹ️',
      }),
    ]);
  });

  it('should update saptune status of a host', async () => {
    const host = hostFactory.build();

    const dispatched = await recordSaga(saptuneStatusUpdated, {
      payload: host,
    });

    expect(dispatched).toEqual([
      updateSaptuneStatus(host),
      notify({
        text: `Saptune status updated in host ${host.hostname}.`,
        icon: 'ℹ️',
      }),
    ]);
  });

  it('should update health status of a host', async () => {
    const { id, hostname, health } = hostFactory.build();

    const dispatched = await recordSaga(hostHealthChanged, {
      payload: { id, hostname, health },
    });

    expect(dispatched).toEqual([
      updateHostHealth({ id, health }),
      notify({
        text: `Host ${hostname} health changed to ${health}.`,
        icon: 'ℹ️',
      }),
    ]);
  });

  it('should fetch SUMA settings and software updates when host software updates discovery is completed', async () => {
    const { id } = hostFactory.build();

    const settingsResponse = softwareUpdatesSettingsFactory.build();

    axiosMock.onGet('/settings/suma_credentials').reply(200, settingsResponse);

    const softwareUpdatesResponse = {
      relevant_patches: [
        {
          date: '2023-05-18',
          advisory_name: 'SUSE-15-SP4-2023-2245',
          advisory_type: 'bugfix',
          advisory_status: 'stable',
          id: 2192,
          advisory_synopsis: 'Recommended update for libzypp, zypper',
          update_date: '2023-05-18',
        },
      ],
      upgradable_packages: [
        {
          from_epoch: ' ',
          to_release: '150400.7.60.2',
          name: 'openssl-1_1',
          from_release: '150400.7.25.1',
          to_epoch: ' ',
          arch: 'x86_64',
          to_package_id: 37454,
          from_version: '1.1.1l',
          to_version: '1.1.1l',
          from_arch: 'x86_64',
          to_arch: 'x86_64',
        },
      ],
    };

    axiosMock
      .onGet(`/api/v1/hosts/${id}/software_updates`)
      .reply(200, softwareUpdatesResponse);

    const dispatched = await recordSaga(hostSoftwareUpdatesDiscoveryCompleted, {
      payload: { id },
    });

    expect(dispatched).toEqual([
      fetchSoftwareUpdatesSettings(),
      fetchSoftwareUpdates(id),
    ]);
  });
});
