import MockAdapter from 'axios-mock-adapter';
import { networkClient, unrecoverableAuthError } from '@lib/network';
import {
  clearCredentialsFromStore,
  storeAccessToken,
  authClient,
  storeRefreshToken,
  getAccessTokenFromStore,
} from '@lib/auth';

const axiosMock = new MockAdapter(networkClient);
const mockAuthClient = new MockAdapter(authClient);

describe('networkClient', () => {
  beforeEach(() => {
    axiosMock.reset();
    mockAuthClient.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
    clearCredentialsFromStore();
  });

  it('should use default baseURL', async () => {
    axiosMock.onGet('/api/v1/test').reply(200, { ok: 'ok' });

    const response = await networkClient.get('/test');

    expect(response.data).toEqual({ ok: 'ok' });
  });

  it('should apply the specific config in each request', async () => {
    axiosMock.onGet('/base/test').reply(200, { ok: 'ok' });

    const response = await networkClient.get('/test', { baseURL: '/base' });

    expect(response.data).toEqual({ ok: 'ok' });
  });

  it('should attach the access token from the store when a request is made', async () => {
    storeAccessToken('test-access');

    axiosMock.onGet('/test').reply(200, {
      ok: 'ok',
    });

    const response = await networkClient.get('/test');

    expect(response.config.headers.Authorization).toEqual('Bearer test-access');
  });

  describe('refresh token flow', () => {
    const realLocation = global.location;

    beforeEach(() => {
      delete global.location;
      global.location = { ...realLocation, assign: jest.fn() };
    });

    afterEach(() => {
      global.location = realLocation;
    });

    it('should try to refresh the token when a 401 is received, fail with unrecoverableAuthError when the refresh token is not present in the store', async () => {
      expect.assertions(1);

      axiosMock.onGet('/test').reply(401, {
        error: 'unauthorized',
      });

      try {
        await networkClient.get('/test');
      } catch (e) {
        expect(e).toEqual(unrecoverableAuthError);
      }
    });
    it('should try to refresh the token when a 401 is received, fail with unrecoverableAuthError when the refresh token request fails', async () => {
      expect.assertions(1);

      storeRefreshToken('refresh-token');

      mockAuthClient.onPost('/api/session/refresh').reply(401, {
        error: 'error',
      });

      axiosMock.onGet('/test').reply(401, {
        error: 'unauthorized',
      });

      try {
        await networkClient.get('/test');
      } catch (e) {
        expect(e).toEqual(unrecoverableAuthError);
      }
    });

    it('should redirect to /session/new with the current pathname as query string parameter when a unrecoverableAuthError is dispatched in the request flow', async () => {
      expect.assertions(2);

      axiosMock.onGet('/test').reply(401, {
        error: 'unauthorized',
      });

      try {
        await networkClient.get('/test');
      } catch (e) {
        expect(e).toEqual(unrecoverableAuthError);
        expect(global.location.assign).toHaveBeenCalledWith(
          '/session/new?request_path=%2F'
        );
      }
    });

    it('should try to refresh the token, and assign the new access token to the store', async () => {
      storeRefreshToken('refresh-token');

      mockAuthClient.onPost('/api/session/refresh').reply(200, {
        access_token: 'new_token',
      });

      // first we return 401, then on the subsequent retried request 200
      // in order to simulate a correct refresh/retry flow
      axiosMock
        .onGet('/test')
        .replyOnce(401, {
          error: 'unauthorized',
        })
        .onGet('/test')
        .reply(200, {});

      await networkClient.get('/test');

      expect(getAccessTokenFromStore()).toEqual('new_token');
    });

    it('should refresh the token and retry the request with the refresh token', async () => {
      storeRefreshToken('refresh-token');

      mockAuthClient.onPost('/api/session/refresh').reply(200, {
        access_token: 'new_token',
      });

      // first we return 401, then on the subsequent retried request 200
      // in order to simulate a correct refresh/retry flow
      axiosMock
        .onGet('/test')
        .replyOnce(401, {
          error: 'unauthorized',
        })
        .onGet('/test')
        .reply(200, {});

      const response = await networkClient.get('/test');
      expect(response.config.headers.Authorization).toEqual('Bearer new_token');
    });

    it('should avoid the looping, when a new access token is obtained but the retried call returns 401', async () => {
      expect.assertions(2);

      storeRefreshToken('refresh-token');

      mockAuthClient.onPost('/api/session/refresh').reply(200, {
        access_token: 'new_token',
      });

      // first we return 401, then on the subsequent retried request 200
      // in order to simulate a correct refresh/retry flow
      axiosMock
        .onGet('/test')
        .replyOnce(401, {
          error: 'unauthorized',
        })
        .onGet('/test')
        .reply(401, {
          error: 'still unauthorized',
        });

      try {
        await networkClient.get('/test');
      } catch (e) {
        expect(e.config.headers.Authorization).toEqual('Bearer new_token');
        expect(e.response.data).toEqual({
          error: 'still unauthorized',
        });
      }
    });
  });
});
