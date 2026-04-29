import { act, renderHook } from '@testing-library/react';

import { useThreadStore } from './useThreadStore';

describe('useThreadStore', () => {
  beforeEach(() => {
    let counter = 0;
    jest.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      counter += 1;
      return `id-${counter}`;
    });
  });

  it('seeds a fresh thread id on first render', () => {
    const { result } = renderHook(() => useThreadStore());
    expect(result.current.adapter.threadId).toBe('id-1');
  });

  it('switches to a new thread by minting a fresh id', async () => {
    const { result } = renderHook(() => useThreadStore());

    await act(() => result.current.adapter.onSwitchToNewThread());

    expect(result.current.adapter.threadId).toBe('id-2');
  });

  it('returns persisted messages when switching back to a known thread', async () => {
    const { result } = renderHook(() => useThreadStore());

    act(() => result.current.persist(['m1', 'm2']));
    await act(() => result.current.adapter.onSwitchToNewThread());

    let restored;
    await act(async () => {
      restored = await result.current.adapter.onSwitchToThread('id-1');
    });

    expect(restored).toEqual({ messages: ['m1', 'm2'] });
    expect(result.current.adapter.threadId).toBe('id-1');
  });

  it('rejects when switching to an unknown thread', async () => {
    const { result } = renderHook(() => useThreadStore());

    await expect(
      result.current.adapter.onSwitchToThread('does-not-exist')
    ).rejects.toThrow('Thread does-not-exist not found');
  });
});
