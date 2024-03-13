import { faker } from '@faker-js/faker';

import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import {
  startLoadingSoftwareUpdates,
  setSoftwareUpdates,
  setSoftwareUpdatesErrors,
  setEmptySoftwareUpdates,
} from '@state/softwareUpdates';

import { fetchSoftwareUpdates } from './softwareUpdates';

describe('Software Updates saga', () => {
  describe('Fetching Software Updates', () => {
    it('should successfully fetch software updates', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const hostId = faker.string.uuid();
      const successfulResponse = {
        relevant_patches: [
          {
            date: '2023-05-18',
            advisory_name: 'SUSE-15-SP4-2023-2245',
            advisory_type: 'Bug Fix Advisory',
            advisory_status: 'stable',
            id: 2192,
            advisory_synopsis: 'Recommended update for libzypp, zypper',
            update_date: '2023-05-18',
          },
        ],
        software_updates: [
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
        .onGet(`/api/v1/hosts/${hostId}/software_updates`)
        .reply(200, successfulResponse);

      const dispatched = await recordSaga(fetchSoftwareUpdates, {
        payload: { hostId, ...successfulResponse },
      });

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdates(),
        setSoftwareUpdates({ hostId, ...successfulResponse }),
      ]);
    });

    it('should empty software updates settings on failed fetching', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const hostId = faker.string.uuid();
      const responses = [
        { status: 404, body: { message: '404 Not found' } },
        { status: 500, body: { message: 'java.lang.NullPointerException' } },
      ];

      /* eslint-disable no-await-in-loop */
      /* eslint-disable no-restricted-syntax */
      for (const { status, body } of responses) {
        axiosMock
          .onGet(`/api/v1/hosts/${hostId}/software_updates`)
          .reply(status, body);

        const dispatched = await recordSaga(fetchSoftwareUpdates, {
          payload: { hostId },
        });

        expect(dispatched).toEqual([
          startLoadingSoftwareUpdates(),
          setEmptySoftwareUpdates({ hostId }),
          setSoftwareUpdatesErrors(body),
        ]);
      }
    });
  });
});
