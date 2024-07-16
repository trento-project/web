import { faker } from '@faker-js/faker';
import MockAdapter from 'axios-mock-adapter';

import { recordSaga } from '@lib/test-utils';
import { patchForPackageFactory } from '@lib/test-utils/factories';

import { networkClient } from '@lib/network';

import {
  setSettingsConfigured,
  setSettingsNotConfigured,
  startLoadingSoftwareUpdates,
  setSoftwareUpdates,
  setSoftwareUpdatesErrors,
  setEmptySoftwareUpdates,
  setPatchesForPackages,
} from '@state/softwareUpdates';

import {
  fetchSoftwareUpdates,
  fetchUpgradablePackagesPatches,
} from './softwareUpdates';

describe('Software Updates saga', () => {
  describe('Fetching Software Updates', () => {
    it('should successfully fetch software updates', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const hostID = faker.string.uuid();
      const response = {
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
        .onGet(`/api/v1/hosts/${hostID}/software_updates`)
        .reply(200, response);

      const dispatched = await recordSaga(fetchSoftwareUpdates, {
        payload: hostID,
      });

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdates({ hostID }),
        setSoftwareUpdates({ hostID, ...response }),
        setSettingsConfigured(),
      ]);
    });

    it.each([
      { status: 404, body: { message: '404 Not found' } },
      { status: 500, body: { message: 'java.lang.NullPointerException' } },
    ])(
      'should empty software updates settings on failed fetching',
      async ({ status, body }) => {
        const axiosMock = new MockAdapter(networkClient);
        const hostID = faker.string.uuid();

        axiosMock
          .onGet(`/api/v1/hosts/${hostID}/software_updates`)
          .reply(status, body);

        const dispatched = await recordSaga(fetchSoftwareUpdates, {
          payload: hostID,
        });

        expect(dispatched).toEqual([
          startLoadingSoftwareUpdates({ hostID }),
          setEmptySoftwareUpdates({ hostID }),
          setSoftwareUpdatesErrors({ hostID, errors: body }),
        ]);
      }
    );

    it('should set settings not configured when 403', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const hostID = faker.string.uuid();

      const errorBody = {
        errors: [
          { title: 'Forbidden', detail: 'SUSE Manager authentication error.' },
        ],
      };

      axiosMock
        .onGet(`/api/v1/hosts/${hostID}/software_updates`)
        .reply(403, errorBody);

      const dispatched = await recordSaga(fetchSoftwareUpdates, {
        payload: hostID,
      });

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdates({ hostID }),
        setEmptySoftwareUpdates({ hostID }),
        setSettingsNotConfigured(),
        setSoftwareUpdatesErrors({ hostID, errors: errorBody }),
      ]);
    });
  });

  describe('Fetching patches for packages', () => {
    it('sets patches for upgradable packages', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const hostID = faker.string.uuid();
      const packageIDs = [faker.string.uuid(), faker.string.uuid()];
      const patches = patchForPackageFactory.buildList(3);
      const response = {
        patches: [
          { package_id: packageIDs[0], patches },
          { package_id: packageIDs[1], patches },
        ],
      };

      axiosMock.onGet(`/api/v1/software_updates/packages`).reply(200, response);

      const dispatched = await recordSaga(fetchUpgradablePackagesPatches, {
        payload: { hostID, packageIDs },
      });

      expect(dispatched).toEqual([
        setPatchesForPackages({ hostID, patches: response.patches }),
        setSettingsConfigured(),
      ]);
    });

    it('should set settings not configured when 403', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const hostID = faker.string.uuid();

      const errorBody = {
        errors: [
          { title: 'Forbidden', detail: 'SUSE Manager authentication error.' },
        ],
      };

      axiosMock
        .onGet(`/api/v1/hosts/${hostID}/software_updates`)
        .reply(403, errorBody);

      const dispatched = await recordSaga(fetchSoftwareUpdates, {
        payload: hostID,
      });

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdates({ hostID }),
        setEmptySoftwareUpdates({ hostID }),
        setSettingsNotConfigured(),
        setSoftwareUpdatesErrors({ hostID, errors: errorBody }),
      ]);
    });
  });
});
