import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { softwareUpdatesSettingsFactory } from '@lib/test-utils/factories/softwareUpdatesSettings';
import {
  startLoadingSoftwareUpdatesSettings,
  setSoftwareUpdatesSettings,
  setEmptySoftwareUpdatesSettings,
} from '@state/softwareUpdatesSettings';

import { fetchSoftwareUpdatesSettings } from './softwareUpdatesSettings';

const axiosMock = new MockAdapter(networkClient);

describe('Software Updates Settings saga', () => {
  describe('Fetching Software Updates Settings', () => {
    it('should successfully fetch software updates settings', async () => {
      const successfulResponse = softwareUpdatesSettingsFactory.build();

      axiosMock
        .onGet('/settings/suma_credentials')
        .reply(200, successfulResponse);

      const dispatched = await recordSaga(fetchSoftwareUpdatesSettings);

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdatesSettings(),
        setSoftwareUpdatesSettings(successfulResponse),
      ]);
    });

    it('should empty software updates settings on failed fetching', async () => {
      [404, 500].forEach(async (errorStatus) => {
        axiosMock.onGet('/settings/suma_credentials').reply(errorStatus);

        const dispatched = await recordSaga(fetchSoftwareUpdatesSettings);

        expect(dispatched).toEqual([
          startLoadingSoftwareUpdatesSettings(),
          setEmptySoftwareUpdatesSettings(),
        ]);
      });
    });
  });
});
