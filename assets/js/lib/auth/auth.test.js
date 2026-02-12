import { authClient, clearCredentialsFromStore, profile } from '@lib/auth';
import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

const axiosMock = new MockAdapter(networkClient);
const mockAuthClient = new MockAdapter(authClient);

describe('auth module', () => {
  beforeEach(() => {
    axiosMock.reset();
    mockAuthClient.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
    clearCredentialsFromStore();
    delete global.window.basePath;
  });

  it('profile uses full /api/v1/profile when called with default authClient', async () => {
    mockAuthClient.onGet('/api/v1/profile').reply(200, { user: 'auth' });

    const data = await profile();

    expect(data).toEqual({ user: 'auth' });
  });

  it('profile uses relative /profile with networkClient (resolving to /api/v1/profile)', async () => {
    axiosMock.onGet('/api/v1/profile').reply(200, { user: 'network' });

    const data = await profile(networkClient);

    expect(data).toEqual({ user: 'network' });
  });

  it('includes window.basePath in authClient baseURL when set before import', async () => {
    jest.resetModules();
    global.window = global.window || {};
    global.window.basePath = '/trento';

    const { authClient: freshAuthClient } = await import('./index');

    expect(freshAuthClient.defaults.baseURL).toBe('/trento');
  });
});
