import { useApiKeySettings } from '@pages/SettingsPage/hooks';
import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';
import { act, renderHook } from '@testing-library/react';
import { hookWrapperWithState } from '@lib/test-utils';

const axiosMock = new MockAdapter(networkClient);

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
