// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { createClient } from '@lib/network/http-client';
import MockAdapter from '@lib/test-utils/mockClient';

describe('createClient', () => {
  let client;
  let mock;

  beforeEach(() => {
    client = createClient({ baseURL: '/api/v1' });
    mock = new MockAdapter(client);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('basic requests', () => {
    it('sends a GET and returns an axios-shaped response', async () => {
      mock.onGet('/api/v1/test').reply(200, { ok: 'ok' });

      const response = await client.get('/test');

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ ok: 'ok' });
      expect(response.config).toBeDefined();
      expect(response.config.url).toBe('/test');
    });

    it('uses the instance baseURL by default', async () => {
      mock.onGet('/api/v1/users').reply(200, []);

      const response = await client.get('/users');

      expect(response.data).toEqual([]);
    });

    it('supports per-request baseURL override', async () => {
      mock.onGet('/base/test').reply(200, { ok: 'ok' });

      const response = await client.get('/test', { baseURL: '/base' });

      expect(response.data).toEqual({ ok: 'ok' });
    });

    it('supports baseURL: "" to bypass the instance baseURL', async () => {
      mock.onGet('/api/v1/profile').reply(200, { id: 1 });

      const response = await client.get('/api/v1/profile', { baseURL: '' });

      expect(response.data).toEqual({ id: 1 });
    });

    it('appends params as a query string', async () => {
      mock.onGet('/api/v1/catalog').reply(200, []);

      await client.get('/catalog', { params: { env: 'azure', page: 2 } });

      expect(mock.history.get[0].params).toEqual({
        env: 'azure',
        page: 2,
      });
    });

    it('sends a POST with a JSON body', async () => {
      mock.onPost('/api/v1/users').reply(201, { id: 1 });

      const response = await client.post('/users', { name: 'alice' });

      expect(response.status).toBe(201);
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        name: 'alice',
      });
    });

    it('sends a DELETE', async () => {
      mock.onDelete('/api/v1/users/1').reply(204);

      const response = await client.delete('/users/1');

      expect(response.status).toBe(204);
      expect(mock.history.delete[0].url).toBe('/users/1');
    });

    it('sends a PATCH', async () => {
      mock.onPatch('/api/v1/users/1').reply(200, { id: 1 });

      await client.patch('/users/1', { name: 'bob' });

      expect(mock.history.patch[0].url).toBe('/users/1');
    });

    it('sends a PUT', async () => {
      mock.onPut('/api/v1/settings').reply(200, {});

      await client.put('/settings', { value: 42 });

      expect(mock.history.put[0].url).toBe('/settings');
    });
  });

  describe('request interceptors', () => {
    it('runs request interceptors before sending', async () => {
      client.interceptors.request.use((config) => {
        config.headers.Authorization = 'Bearer my-token';
        return config;
      });

      mock.onGet('/api/v1/test').reply(200, {});

      const response = await client.get('/test');

      expect(response.config.headers.Authorization).toBe('Bearer my-token');
    });
  });

  describe('response interceptors', () => {
    it('runs onFulfilled for 2xx responses', async () => {
      client.interceptors.response.use((response) => {
        response.data.intercepted = true;
        return response;
      });

      mock.onGet('/api/v1/test').reply(200, { ok: true });

      const response = await client.get('/test');

      expect(response.data).toEqual({ ok: true, intercepted: true });
    });

    it('runs onRejected for non-2xx responses', async () => {
      const seen = jest.fn();
      client.interceptors.response.use(null, (error) => {
        seen(error.response.status);
        throw error;
      });

      mock.onGet('/api/v1/test').reply(403, { error: 'forbidden' });

      await expect(client.get('/test')).rejects.toThrow();
      expect(seen).toHaveBeenCalledWith(403);
    });
  });

  describe('error shape', () => {
    it('throws an axios-like error for 4xx with response.data and config', async () => {
      mock.onGet('/api/v1/test').reply(422, { errors: ['bad'] });

      try {
        await client.get('/test');
        throw new Error('should have thrown');
      } catch (error) {
        expect(error.message).toBe('Request failed with status code 422');
        expect(error.response.status).toBe(422);
        expect(error.response.data).toEqual({ errors: ['bad'] });
        expect(error.config.url).toBe('/test');
      }
    });

    it('throws a Network Error (no .response) on network failure', async () => {
      mock.onGet('/api/v1/test').networkError();

      try {
        await client.get('/test');
        throw new Error('should have thrown');
      } catch (error) {
        expect(error.message).toBe('Network Error');
        expect(error.response).toBeUndefined();
        expect(error.config.url).toBe('/test');
      }
    });
  });

  describe('refresh-on-401', () => {
    it('refreshes the token and retries the request once', async () => {
      const refreshFn = jest.fn(async (config) => {
        config.headers.Authorization = 'Bearer new-token';
        return config;
      });

      const refreshClient = createClient({
        baseURL: '/api/v1',
        refreshAuthLogic: refreshFn,
      });
      const refreshMock = new MockAdapter(refreshClient);

      refreshMock
        .onGet('/api/v1/test')
        .replyOnce(401, { error: 'unauthorized' })
        .onGet('/api/v1/test')
        .reply(200, { ok: true });

      const response = await refreshClient.get('/test');

      expect(refreshFn).toHaveBeenCalledTimes(1);
      expect(response.data).toEqual({ ok: true });
      expect(response.config.headers.Authorization).toBe('Bearer new-token');

      refreshMock.restore();
    });

    it('propagates the error when refreshAuthLogic throws', async () => {
      const unrecoverable = new Error('unrecoverable');

      const refreshClient = createClient({
        baseURL: '/api/v1',
        refreshAuthLogic: async () => {
          throw unrecoverable;
        },
      });
      const refreshMock = new MockAdapter(refreshClient);

      refreshMock.onGet('/api/v1/test').reply(401, { error: 'unauthorized' });

      await expect(refreshClient.get('/test')).rejects.toBe(unrecoverable);

      refreshMock.restore();
    });

    it('does not loop when the retried request also returns 401', async () => {
      const refreshFn = jest.fn(async (config) => {
        config.headers.Authorization = 'Bearer new-token';
        return config;
      });

      const refreshClient = createClient({
        baseURL: '/api/v1',
        refreshAuthLogic: refreshFn,
      });
      const refreshMock = new MockAdapter(refreshClient);

      refreshMock
        .onGet('/api/v1/test')
        .replyOnce(401, { error: 'unauthorized' })
        .onGet('/api/v1/test')
        .reply(401, { error: 'still unauthorized' });

      try {
        await refreshClient.get('/test');
        throw new Error('should have thrown');
      } catch (error) {
        expect(refreshFn).toHaveBeenCalledTimes(1);
        expect(error.response.status).toBe(401);
        expect(error.response.data).toEqual({ error: 'still unauthorized' });
        expect(error.config.headers.Authorization).toBe('Bearer new-token');
      }

      refreshMock.restore();
    });
  });

  describe('mock helper features', () => {
    it('supports regex URL matchers', async () => {
      mock.onGet(/\/api\/v1\/charts.*/).reply(200, {});

      const response = await client.get('/charts/123');

      expect(response.status).toBe(200);
    });

    it('supports body matchers for POST', async () => {
      mock
        .onPost('/api/v1/session', { username: 'alice', password: 'secret' })
        .reply(200, { access_token: 'tok' });

      const response = await client.post('/session', {
        username: 'alice',
        password: 'secret',
      });

      expect(response.data.access_token).toBe('tok');
    });

    it('does not match when the body differs', async () => {
      mock
        .onPost('/api/v1/session', { username: 'alice' })
        .reply(200, { ok: true });

      // Body doesn't match → falls through to 404
      await expect(
        client.post('/session', { username: 'bob' })
      ).rejects.toThrow('Request failed with status code 404');
    });

    it('records history per method', async () => {
      mock.onGet('/api/v1/a').reply(200, {});
      mock.onPost('/api/v1/b').reply(201, {});

      await client.get('/a');
      await client.post('/b', { x: 1 });

      expect(mock.history.get).toHaveLength(1);
      expect(mock.history.get[0].url).toBe('/a');
      expect(mock.history.post).toHaveLength(1);
      expect(mock.history.post[0].url).toBe('/b');
      expect(JSON.parse(mock.history.post[0].data)).toEqual({ x: 1 });
    });

    it('resets handlers and history', async () => {
      mock.onGet('/api/v1/test').reply(200, {});
      await client.get('/test');

      mock.reset();

      expect(mock.history.get).toHaveLength(0);
      await expect(client.get('/test')).rejects.toThrow(
        'Request failed with status code 404'
      );
    });
  });

  // MockAdapter swaps the client's transport out entirely, so these exercise
  // the real fetch-backed one: URL building, body encoding and response
  // parsing are only covered here.
  describe('fetch transport', () => {
    let fetchMock;
    let fetchClient;

    beforeEach(() => {
      fetchMock = jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Map([['etag', 'W/"an-etag"']]),
        text: () => Promise.resolve(JSON.stringify({ ok: 'ok' })),
      });
      global.fetch = fetchMock;
      fetchClient = createClient({ baseURL: '/api/v1' });
    });

    afterEach(() => {
      delete global.fetch;
    });

    const requestedUrl = () => fetchMock.mock.calls[0][0];
    const requestedOptions = () => fetchMock.mock.calls[0][1];

    it('repeats array params as `key[]` pairs', async () => {
      await fetchClient.get('/activity_log', {
        params: { severity: ['info', 'warning', 'critical'] },
      });

      expect(requestedUrl()).toBe(
        '/api/v1/activity_log?severity%5B%5D=info&severity%5B%5D=warning&severity%5B%5D=critical'
      );
    });

    it('omits undefined and null params, keeping false and 0', async () => {
      await fetchClient.get('/activity_log', {
        params: {
          search: 'foo',
          after: undefined,
          to_date: null,
          first: 0,
          archived: false,
        },
      });

      expect(requestedUrl()).toBe(
        '/api/v1/activity_log?search=foo&first=0&archived=false'
      );
    });

    it('sends dates as ISO strings', async () => {
      await fetchClient.get('/activity_log', {
        params: { from_date: new Date('2024-08-13T10:21:00.000Z') },
      });

      expect(requestedUrl()).toBe(
        '/api/v1/activity_log?from_date=2024-08-13T10%3A21%3A00.000Z'
      );
    });

    it('leaves the url untouched when there is nothing to serialize', async () => {
      await fetchClient.get('/activity_log', { params: { type: [] } });

      expect(requestedUrl()).toBe('/api/v1/activity_log');
    });

    it('JSON-encodes the body and sets the content type', async () => {
      await fetchClient.post('/users', { name: 'alice' });

      expect(requestedOptions().method).toBe('POST');
      expect(requestedOptions().body).toBe(JSON.stringify({ name: 'alice' }));
      expect(requestedOptions().headers['Content-Type']).toBe(
        'application/json'
      );
    });

    it('sends no body for a GET', async () => {
      await fetchClient.get('/users');

      expect(requestedOptions().body).toBeUndefined();
    });

    it('forwards per-request headers', async () => {
      await fetchClient.patch(
        '/users/1',
        { name: 'alice' },
        { headers: { 'if-match': 'W/"an-etag"' } }
      );

      expect(requestedOptions().headers['if-match']).toBe('W/"an-etag"');
    });

    it('exposes response headers case-insensitively', async () => {
      const response = await fetchClient.get('/users/1');

      expect(response.headers.etag).toBe('W/"an-etag"');
      expect(response.headers.get('ETag')).toBe('W/"an-etag"');
    });

    it('parses a JSON body and returns an axios-shaped response', async () => {
      const response = await fetchClient.get('/users');

      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
      expect(response.data).toEqual({ ok: 'ok' });
    });

    it('leaves data undefined on an empty body', async () => {
      fetchMock.mockResolvedValue({
        status: 204,
        statusText: 'No Content',
        headers: new Map(),
        text: () => Promise.resolve(''),
      });

      const response = await fetchClient.delete('/users/1');

      expect(response.status).toBe(204);
      expect(response.data).toBeUndefined();
    });

    it('throws a Network Error when fetch rejects', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(fetchClient.get('/users')).rejects.toThrow('Network Error');
    });
  });
});
