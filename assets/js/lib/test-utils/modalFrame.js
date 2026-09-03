// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { act } from '@testing-library/react';

// Sets the launcher origin for testing: the point just above the launcher
// where the popover lands. jsdom cannot measure it, so the spot comes from
// `fixed right-6 bottom-20 size-12` and `sideOffset={16}` in ModalFrame.
export const launcherOrigin = ({ width, height }) => ({
  x: width - 24,
  y: height - (80 + 48 + 16),
});

// Waits a render frame, because the hook measures the popover inside a
// `requestAnimationFrame`; until it lands the chat has no geometry to render.
export const nextFrame = () =>
  act(() => new Promise(window.requestAnimationFrame));
