// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import MockAdapter from 'axios-mock-adapter';
import {
  authClient,
  clearCredentialsFromStore,
  getAccessTokenFromStore,
  refreshAndStoreAccessToken,
  storeRefreshToken,
} from './index';

const mockAuth = new MockAdapter(authClient);

describe('refreshAndStoreAccessToken', () => {
  beforeEach(() => {
    mockAuth.reset();
    clearCredentialsFromStore();
  });

  afterEach(() => {
    clearCredentialsFromStore();
  });

  it('exchanges the stored refresh token for a new access token, stores it, and returns it', async () => {
    storeRefreshToken('my-refresh-token');
    mockAuth.onPost('/api/session/refresh').reply(200, {
      access_token: 'new-access-token',
    });

    await refreshAndStoreAccessToken();

    expect(getAccessTokenFromStore()).toBe('new-access-token');
    const [req] = mockAuth.history.post;
    expect(JSON.parse(req.data)).toEqual({ refresh_token: 'my-refresh-token' });
  });

  it('throws without calling the endpoint when no refresh token is in storage', async () => {
    await expect(refreshAndStoreAccessToken()).rejects.toThrow(
      'could not refresh access token'
    );
    expect(mockAuth.history.post).toHaveLength(0);
  });

  it('propagates the error when the refresh endpoint rejects', async () => {
    storeRefreshToken('my-refresh-token');
    mockAuth.onPost('/api/session/refresh').reply(401);

    await expect(refreshAndStoreAccessToken()).rejects.toThrow();
    expect(getAccessTokenFromStore()).toBeNull();
  });
});
