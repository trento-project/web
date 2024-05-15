import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { apiKeySettingsFactory } from '@lib/test-utils/factories/settings';
import { addDays, addHours, formatISO, subDays } from 'date-fns';
import { notify, dismissableNotify } from '@state/notifications';
import { checkApiKeyExpiration } from './settings';

const axiosMock = new MockAdapter(networkClient);

describe('Settings sagas', () => {
  beforeEach(() => {
    axiosMock.reset();
  });

  describe('checkApiKeyExpiration saga', () => {
    it('should skip any expiration toast creation when the expire_at of the api key is not defined', async () => {
      axiosMock
        .onGet('/api/v1/settings/api_key')
        .reply(200, apiKeySettingsFactory.build({ expire_at: null }));

      const dispatched = await recordSaga(checkApiKeyExpiration, {});

      expect(dispatched).toEqual([]);
    });

    it('should dispatch an expired key notification if the expire_at of the api key is in the past', async () => {
      axiosMock.onGet('/api/v1/settings/api_key').reply(
        200,
        apiKeySettingsFactory.build({
          expire_at: formatISO(subDays(new Date(), 2)),
        })
      );

      const dispatched = await recordSaga(checkApiKeyExpiration, {});
      const expectedAction = notify({
        text: 'API Key has expired. Go to Settings to issue a new key',
        icon: 'critical',
        duration: Infinity,
        id: 'api-key-expiration-toast',
        isHealthIcon: true,
      });
      expect(dispatched).toEqual([expectedAction]);
    });

    it('should dispatch a dismissable notification if the api key is to expire in less than 30 days', async () => {
      axiosMock.onGet('/api/v1/settings/api_key').reply(
        200,
        apiKeySettingsFactory.build({
          expire_at: formatISO(addDays(new Date(), 3)),
        })
      );

      const dispatched = await recordSaga(checkApiKeyExpiration, {});
      const expectedAction = dismissableNotify({
        text: `API Key expires in 2 days`,
        icon: 'warning',
        duration: Infinity,
        id: 'api-key-expiration-toast',
        isHealthIcon: true,
      });
      expect(dispatched).toEqual([expectedAction]);
    });

    it('should not dispatch any action if the api key expiration days are more then 30', async () => {
      axiosMock.onGet('/api/v1/settings/api_key').reply(
        200,
        apiKeySettingsFactory.build({
          expire_at: formatISO(addDays(new Date(), 32)),
        })
      );

      const dispatched = await recordSaga(checkApiKeyExpiration, {});
      expect(dispatched).toEqual([]);
    });

    it('should dispatch a dismissable notification if the api key is going to expire the same day', async () => {
      axiosMock.onGet('/api/v1/settings/api_key').reply(
        200,
        apiKeySettingsFactory.build({
          expire_at: formatISO(addHours(new Date(), 2)),
        })
      );
      const dispatched = await recordSaga(checkApiKeyExpiration, {});
      const expectedAction = dismissableNotify({
        text: `API Key expires today`,
        icon: 'warning',
        duration: Infinity,
        id: 'api-key-expiration-toast',
        isHealthIcon: true,
      });
      expect(dispatched).toEqual([expectedAction]);
    });
  });
});
