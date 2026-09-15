// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { act, fireEvent, renderHook } from '@testing-library/react';

import { launcherOrigin, nextFrame } from '@lib/test-utils/modalFrame';

import { useFrameGeometry } from './hooks';

const setViewport = ({ width, height }) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// The launcher is fixed to the window's edges, so it moves on resize; the spot
// is re-read on every measurement instead of captured once.
const currentLauncherOrigin = () =>
  launcherOrigin({ width: window.innerWidth, height: window.innerHeight });

const popoverAt = (origin) =>
  jest
    .spyOn(window.Element.prototype, 'getBoundingClientRect')
    .mockImplementation(() => {
      const { x, y } = origin();

      return {
        x,
        y,
        left: x,
        top: y,
        right: x,
        bottom: y,
        width: 0,
        height: 0,
        toJSON: () => ({}),
      };
    });

const openPopover = () => document.createElement('div');

const renderFrameGeometry = async () => {
  const { result } = renderHook(() => useFrameGeometry());

  const show = async (open) => {
    act(() => {
      result.current.popoverRef(open ? openPopover() : null);
    });
    await nextFrame();
  };

  await show(true);

  return { hook: result, show };
};

const resizeTo = async (viewport) => {
  act(() => {
    setViewport(viewport);
    fireEvent.resize(window);
  });
  await nextFrame();
};

// What react-rnd hands back after the user drags or resizes:
// a size, and a position relative to the collapsed popover box.
const droppedFrame = {
  size: { width: 800, height: 700 },
  position: { x: -820, y: -724 },
};

describe('useFrameGeometry', () => {
  const originalViewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  beforeEach(() => popoverAt(currentLauncherOrigin));

  afterEach(() => {
    jest.restoreAllMocks();
    setViewport(originalViewport);
  });

  it('has nowhere to put the frame until the popover has been measured', () => {
    setViewport({ width: 1920, height: 1080 });
    const { result } = renderHook(() => useFrameGeometry());

    act(() => {
      result.current.popoverRef(openPopover());
    });

    expect(result.current.geometry).toBeNull();
  });

  it('reads where the popover actually is, not where the launcher should be', async () => {
    setViewport({ width: 1920, height: 1080 });
    popoverAt(() => ({ x: 300, y: 900 }));

    const { hook } = await renderFrameGeometry();

    expect(hook.current.geometry.size).toEqual({ width: 276, height: 650 });
  });

  it('follows the window while the user has not touched the frame', async () => {
    setViewport({ width: 1920, height: 1080 });
    const { hook } = await renderFrameGeometry();

    await resizeTo({ width: 1366, height: 768 });

    expect(hook.current.geometry.size).toEqual({ width: 384, height: 600 });
  });

  it('measures the popover again when it is closed and reopened', async () => {
    setViewport({ width: 1920, height: 1080 });
    const { hook, show } = await renderFrameGeometry();

    await show(false);
    expect(hook.current.geometry).toBeNull();

    setViewport({ width: 1366, height: 768 });
    await show(true);

    expect(hook.current.geometry.size).toEqual({ width: 384, height: 600 });
  });

  it('keeps the frame where the user put it when the window is resized', async () => {
    setViewport({ width: 1920, height: 1080 });
    const { hook } = await renderFrameGeometry();

    act(() => {
      hook.current.rememberGeometry(droppedFrame);
    });
    await resizeTo({ width: 1600, height: 1000 });

    expect(hook.current.geometry).toMatchObject(droppedFrame);
  });

  it('stops listening for resizes once the popover is gone', async () => {
    const listen = jest.spyOn(window, 'addEventListener');
    const stopListening = jest.spyOn(window, 'removeEventListener');

    const { show } = await renderFrameGeometry();
    const [, measure] = listen.mock.calls.find(([event]) => event === 'resize');

    await show(false);

    expect(stopListening).toHaveBeenCalledWith('resize', measure);
  });
});
