// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { computeFrameGeometry, readViewport } from './geometry';

/**
 * Where the chat frame should sit, kept in step with the window.
 *
 * Put `popoverRef` on the popover the chat opens inside. The chat is
 * absolutely positioned, so that popover collapses to a single point, and
 * every position here is an offset from it.
 *
 * `geometry` is null until that point has been measured; render nothing until
 * it is. An untouched chat follows the window; hand `rememberGeometry` the size
 * and position the user dropped the chat at, and it stays there instead.
 *
 * @returns {{ geometry: Object|null, rememberGeometry: (geometry: Object) => void, popoverRef: (node: Element|null) => void }}
 */
export const useFrameGeometry = () => {
  const [popover, setPopover] = useState(null);
  const [measurement, setMeasurement] = useState(null);
  const [frameWhenPlaced, setFrameWhenPlaced] = useState(null);

  useEffect(() => {
    if (!popover) return undefined;

    let pendingMeasurement = 0;

    // The popover sits off screen until positioned, so measure a frame later.
    const measure = () => {
      window.cancelAnimationFrame(pendingMeasurement);
      pendingMeasurement = window.requestAnimationFrame(() => {
        const popoverBox = popover.getBoundingClientRect();

        setMeasurement({
          popover,
          viewport: readViewport(),
          origin: { x: popoverBox.left, y: popoverBox.top },
        });
      });
    };

    measure();
    window.addEventListener('resize', measure);

    return () => {
      window.cancelAnimationFrame(pendingMeasurement);
      window.removeEventListener('resize', measure);
    };
  }, [popover]);

  // The popover goes away when the chat closes, so a stale measurement must not place the chat the user opens next
  const currentMeasurement =
    measurement?.popover === popover ? measurement : null;

  const geometry = useMemo(
    () =>
      currentMeasurement
        ? computeFrameGeometry(
            currentMeasurement.viewport,
            currentMeasurement.origin,
            frameWhenPlaced
          )
        : null,
    [currentMeasurement, frameWhenPlaced]
  );

  const rememberGeometry = ({ size, position }) =>
    setFrameWhenPlaced({
      size,
      rect: {
        left: currentMeasurement.origin.x + position.x,
        top: currentMeasurement.origin.y + position.y,
      },
      viewport: currentMeasurement.viewport,
    });

  return { geometry, rememberGeometry, popoverRef: setPopover };
};

export default useFrameGeometry;
