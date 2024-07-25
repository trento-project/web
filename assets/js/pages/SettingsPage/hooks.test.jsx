import {
  useApiKeySettings,
  useSuseManagerSettings,
} from '@pages/SettingsPage/hooks';
import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';
import { faker } from '@faker-js/faker';
import { act, renderHook } from '@testing-library/react';
import { hookWrapperWithState } from '@lib/test-utils';

const axiosMock = new MockAdapter(networkClient);

describe('useSuseManagerSettings', () => {
  const baseSumaSettings = {
    username: 'testsuma',
    ca_upload_at: null,
    url: 'http://localhost:8080',
  };

  afterEach(() => {
    axiosMock.reset();
  });

  beforeEach(() => {
    axiosMock.onGet('/settings/suse_manager').reply(200, baseSumaSettings);
  });

  it('should fetch suse manager on mount and return the settings', async () => {
    let hookResult;
    const [hookWrapper, _] = hookWrapperWithState();

    await act(() => {
      const { result } = renderHook(() => useSuseManagerSettings(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });
    expect(hookResult.current.suseManagerSettingsLoading).toBe(false);
    expect(hookResult.current.suseManagerSettings).toEqual(baseSumaSettings);
    expect(hookResult.current.suseManagerSettingsEntityErrors).toEqual([]);
    expect(hookResult.current.suseManagerSettingsfetchError).toEqual(false);
  });

  it('should perform the suse manager settings saving when the hook callback is called', async () => {
    let hookResult;
    const [hookWrapper, _] = hookWrapperWithState();

    await act(() => {
      const { result } = renderHook(() => useSuseManagerSettings(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });

    const newSettings = {
      url: faker.internet.url(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
    };

    axiosMock
      .onPost('/api/v1/settings/suse_manager', newSettings)
      .reply(200, newSettings);

    await act(() => {
      hookResult.current.saveSuseManagerSettings(newSettings);
    });

    expect(hookResult.current.suseManagerSettings).toEqual(newSettings);
    expect(hookResult.current.suseManagerSettingsEntityErrors).toEqual([]);
  });

  it('should perform the suse manager settings update when the hook callback is called and no errors are returned', async () => {
    let hookResult;
    const [hookWrapper, _] = hookWrapperWithState();

    await act(() => {
      const { result } = renderHook(() => useSuseManagerSettings(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });

    const newSettings = {
      url: faker.internet.url(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
    };

    axiosMock
      .onPatch('/api/v1/settings/suse_manager', newSettings)
      .reply(200, newSettings);

    await act(() => {
      hookResult.current.updateSuseManagerSettings(newSettings);
    });

    expect(hookResult.current.suseManagerSettings).toEqual(newSettings);
    expect(hookResult.current.suseManagerSettingsEntityErrors).toEqual([]);
  });

  it('should not perform the suse manager settings update when the hook callback is called and errors are returned', async () => {
    let hookResult;
    const [hookWrapper, _] = hookWrapperWithState();

    await act(() => {
      const { result } = renderHook(() => useSuseManagerSettings(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });

    const newSettings = {
      url: faker.internet.url(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
    };

    axiosMock.onPatch('/api/v1/settings/suse_manager', newSettings).reply(422, {
      errors: [{ error: 'error' }],
    });

    await act(() => {
      hookResult.current.updateSuseManagerSettings(newSettings);
    });

    expect(hookResult.current.suseManagerSettings).toEqual(baseSumaSettings);
    expect(hookResult.current.suseManagerSettingsEntityErrors).toEqual([
      { error: 'error' },
    ]);
  });

  it('should perform the suse manager settings delete when the hook callback is called and no errors are returned', async () => {
    let hookResult;
    const [hookWrapper, _] = hookWrapperWithState();

    await act(() => {
      const { result } = renderHook(() => useSuseManagerSettings(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });

    axiosMock.onDelete('/api/v1/settings/suse_manager').reply(204, {});

    await act(() => {
      hookResult.current.deleteSuseManagerSettings();
    });

    expect(hookResult.current.suseManagerSettings).toEqual({});
    expect(hookResult.current.suseManagerSettingsEntityErrors).toEqual([]);
  });

  it('should not perform the suse manager settings delete when the hook callback is called and errors are returned', async () => {
    let hookResult;
    const [hookWrapper, store] = hookWrapperWithState();

    await act(() => {
      const { result } = renderHook(() => useSuseManagerSettings(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });

    axiosMock.onDelete('/api/v1/settings/suse_manager').reply(422, {
      errors: [{ error: 'error' }],
    });

    await act(() => {
      hookResult.current.deleteSuseManagerSettings();
    });

    expect(hookResult.current.suseManagerSettings).toEqual(baseSumaSettings);

    expect(store.getActions()).toEqual([
      {
        type: 'NOTIFICATION',
        payload: { text: `Unable to clear settings`, icon: '❌' },
      },
    ]);
  });

  it('should test the suse manager settings and spawn a toast when the connection succeded', async () => {
    let hookResult;
    const [hookWrapper, store] = hookWrapperWithState();

    await act(() => {
      const { result } = renderHook(() => useSuseManagerSettings(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });

    axiosMock.onPost('/api/v1/settings/suse_manager/test').reply(200);

    await act(() => {
      hookResult.current.testSuseManagerSettings();
    });

    expect(hookResult.current.suseManagerSettings).toEqual(baseSumaSettings);
    expect(hookResult.current.suseManagerSettingsTesting).toEqual(false);

    expect(store.getActions()).toEqual([
      {
        type: 'NOTIFICATION',
        payload: { text: `Connection succeeded!`, icon: '✅' },
      },
    ]);
  });

  it('should test the suse manager settings and spawn a toast when the connection fails', async () => {
    let hookResult;
    const [hookWrapper, store] = hookWrapperWithState();

    await act(() => {
      const { result } = renderHook(() => useSuseManagerSettings(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });

    axiosMock.onPost('/api/v1/settings/suse_manager/test').reply(500);

    await act(() => {
      hookResult.current.testSuseManagerSettings();
    });

    expect(hookResult.current.suseManagerSettings).toEqual(baseSumaSettings);
    expect(hookResult.current.suseManagerSettingsTesting).toEqual(false);

    expect(store.getActions()).toEqual([
      {
        type: 'NOTIFICATION',
        payload: { text: `Connection failed!`, icon: '❌' },
      },
    ]);
  });
});

describe('useApiKeySettings', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  beforeEach(() => {
    axiosMock.onGet('/api/v1/settings/api_key').reply(200, {
      expire_at: null,
      generated_api_key: 'api_key',
    });
  });

  it('should fetch the api key settings on mount and return the settings', async () => {
    let hookResult;
    const [hookWrapper, _] = hookWrapperWithState();

    await act(() => {
      const { result } = renderHook(() => useApiKeySettings(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });
    expect(hookResult.current.apiKeyLoading).toBe(false);
    expect(hookResult.current.apiKey).toBe('api_key');
  });

  it('should perform the api key saving when the save callback is called', async () => {
    let hookResult;
    const [hookWrapper, store] = hookWrapperWithState();

    await act(() => {
      const { result } = renderHook(() => useApiKeySettings(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });

    const newExpiration = new Date().toISOString();

    axiosMock
      .onPatch('/api/v1/settings/api_key', { expire_at: newExpiration })
      .reply(200, {
        expire_at: newExpiration,
        generated_api_key: 'new_api_key',
      });

    await act(() => {
      hookResult.current.saveApiKeySettings(newExpiration);
    });
    expect(hookResult.current.apiKey).toBe('new_api_key');
    expect(hookResult.current.apiKeyExpiration).toBe(newExpiration);
    expect(store.getActions()).toEqual([
      {
        type: 'DISMISS_NOTIFICATION',
        payload: { id: 'api-key-expiration-toast' },
      },
    ]);
  });

  it('should refetch api key when the fetchApiKeySettings callback is called', async () => {
    let hookResult;
    const [hookWrapper, _] = hookWrapperWithState();

    await act(() => {
      const { result } = renderHook(() => useApiKeySettings(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });

    axiosMock.onGet('/api/v1/settings/api_key').reply(200, {
      expire_at: null,
      generated_api_key: 'new_api_key',
    });

    await act(() => {
      hookResult.current.fetchApiKeySettings();
    });

    expect(hookResult.current.apiKey).toBe('new_api_key');
  });
});
