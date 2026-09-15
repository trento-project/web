// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { launcherOrigin } from '@lib/test-utils/modalFrame';

import { MIN_HEIGHT, computeFrameGeometry } from './geometry';

const frameGeometry = (viewport, frameWhenPlaced) =>
  computeFrameGeometry(viewport, launcherOrigin(viewport), frameWhenPlaced);

// Positions are offsets from that origin; as a viewport rect they become claims
// about what the user can see on screen.
const frameRect = (viewport, frameWhenPlaced) => {
  const origin = launcherOrigin(viewport);
  const { size, position } = frameGeometry(viewport, frameWhenPlaced);
  const left = origin.x + position.x;
  const top = origin.y + position.y;

  return {
    left,
    top,
    right: left + size.width,
    bottom: top + size.height,
  };
};

describe('ModalFrame geometry', () => {
  describe('above the launcher', () => {
    it.each`
      screen                | width   | height  | expectedWidth | expectedHeight
      ${'4k desktop'}       | ${2560} | ${1440} | ${384}        | ${650}
      ${'laptop'}           | ${1920} | ${1080} | ${384}        | ${650}
      ${'14" macbook'}      | ${1512} | ${860}  | ${384}        | ${650}
      ${'short laptop'}     | ${1366} | ${768}  | ${384}        | ${600}
      ${'tablet landscape'} | ${1024} | ${768}  | ${384}        | ${600}
      ${'tablet portrait'}  | ${768}  | ${1024} | ${384}        | ${650}
    `(
      'sizes the frame $expectedWidth x $expectedHeight on a $screen',
      ({ width, height, expectedWidth, expectedHeight }) => {
        expect(frameGeometry({ width, height }).size).toEqual({
          width: expectedWidth,
          height: expectedHeight,
        });
      }
    );

    it('sizes the frame from the measured popover origin, not the viewport', () => {
      const geometry = computeFrameGeometry(
        { width: 1920, height: 1080 },
        { x: 300, y: 900 }
      );

      expect(geometry.size).toEqual({ width: 276, height: 650 });
    });

    it('opens right above the launcher', () => {
      const viewport = { width: 1920, height: 1080 };

      expect(frameRect(viewport)).toEqual({
        left: 1496,
        top: 286,
        right: 1880,
        bottom: 936,
      });
    });

    it('shrinks instead of pushing the drag handle off screen', () => {
      const viewport = { width: 1366, height: 768 };

      expect(frameRect(viewport).top).toBe(24);
    });

    it('caps a manual resize at the space the frame can occupy', () => {
      const { maxWidth, maxHeight } = frameGeometry({
        width: 1366,
        height: 768,
      });

      expect(maxWidth).toBe(1318);
      expect(maxHeight).toBe(600);
    });
  });

  describe('too small to fit above the launcher', () => {
    it.each`
      screen               | width   | height
      ${'phone portrait'}  | ${390}  | ${844}
      ${'phone landscape'} | ${844}  | ${390}
      ${'small phone'}     | ${320}  | ${568}
      ${'short window'}    | ${1200} | ${500}
    `('fills the whole $screen viewport', ({ width, height }) => {
      const viewport = { width, height };

      expect(frameGeometry(viewport).size).toEqual({ width, height });
      expect(frameRect(viewport)).toEqual({
        left: 0,
        top: 0,
        right: width,
        bottom: height,
      });
    });
  });

  describe('a frame the user has placed', () => {
    // 44px from the right edge and 168px from the bottom: nearer both, so it
    // holds on to both.
    const frameWhenPlaced = {
      size: { width: 800, height: 700 },
      rect: { left: 1076, top: 212 },
      viewport: { width: 1920, height: 1080 },
    };

    it('leaves a frame that still fits where the user put it', () => {
      expect(frameRect({ width: 1920, height: 1080 }, frameWhenPlaced)).toEqual(
        {
          left: 1076,
          top: 212,
          right: 1876,
          bottom: 912,
        }
      );
    });

    it('leaves a frame the user pushed against an edge against it', () => {
      const flushToTheCorner = {
        size: { width: 384, height: 650 },
        rect: { left: 0, top: 0 },
        viewport: { width: 1920, height: 1080 },
      };

      expect(
        frameRect({ width: 1920, height: 1080 }, flushToTheCorner)
      ).toEqual({ left: 0, top: 0, right: 384, bottom: 650 });
    });

    it('keeps a frame docked against the left edge docked', () => {
      const dockedLeft = {
        size: { width: 384, height: 650 },
        rect: { left: 0, top: 336 },
        viewport: { width: 1920, height: 1080 },
      };

      expect(frameRect({ width: 1900, height: 1080 }, dockedLeft).left).toBe(0);
      expect(frameRect({ width: 1940, height: 1080 }, dockedLeft).left).toBe(0);
    });

    it('keeps a frame docked against the top edge docked', () => {
      const dockedTop = {
        size: { width: 384, height: 650 },
        rect: { left: 1396, top: 0 },
        viewport: { width: 1920, height: 1080 },
      };

      expect(frameRect({ width: 1920, height: 1060 }, dockedTop).top).toBe(0);
      expect(frameRect({ width: 1920, height: 1100 }, dockedTop).top).toBe(0);
    });

    it('keeps a frame docked against the right edge docked', () => {
      const dockedRight = {
        size: { width: 384, height: 650 },
        rect: { left: 1536, top: 336 },
        viewport: { width: 1920, height: 1080 },
      };

      expect(frameRect({ width: 1900, height: 1080 }, dockedRight).right).toBe(
        1900
      );
      expect(frameRect({ width: 1940, height: 1080 }, dockedRight).right).toBe(
        1940
      );
    });

    it('pulls a frame that no longer fits back inside the window', () => {
      expect(frameRect({ width: 900, height: 600 }, frameWhenPlaced)).toEqual({
        left: 56,
        top: 0,
        right: 856,
        bottom: 600,
      });
    });

    it('gives the user their size back when the window grows again', () => {
      expect(
        frameGeometry({ width: 900, height: 600 }, frameWhenPlaced).size
      ).toEqual({ width: 800, height: 600 });

      expect(
        frameGeometry({ width: 1920, height: 1080 }, frameWhenPlaced).size
      ).toEqual({ width: 800, height: 700 });
    });

    it('caps a manual resize at the region the frame is kept inside', () => {
      const { maxWidth, maxHeight } = frameGeometry(
        { width: 900, height: 600 },
        frameWhenPlaced
      );

      expect(maxWidth).toBe(900);
      expect(maxHeight).toBe(600);
    });

    it('still falls back to the whole viewport when the window is too small', () => {
      const viewport = { width: 1200, height: 500 };

      expect(frameGeometry(viewport, frameWhenPlaced).size).toEqual(viewport);
    });
  });

  describe('invariants', () => {
    const viewports = [
      320, 390, 640, 768, 1024, 1200, 1366, 1920, 2560,
    ].flatMap((width) =>
      [400, 500, 568, 640, 768, 860, 1080, 1440].map((height) => ({
        width,
        height,
      }))
    );

    it('stays fully inside every viewport', () => {
      const offScreen = viewports.filter((viewport) => {
        const { left, top, right, bottom } = frameRect(viewport);

        return (
          left < 0 ||
          top < 0 ||
          right > viewport.width ||
          bottom > viewport.height
        );
      });

      expect(offScreen).toEqual([]);
    });

    // The edges a frame holds on to decide which way it can fall off screen, so
    // both cases have to be swept.
    it.each`
      held            | frame
      ${'far edges'}  | ${{ size: { width: 1200, height: 900 }, rect: { left: 1316, top: 372 }, viewport: { width: 2560, height: 1440 } }}
      ${'near edges'} | ${{ size: { width: 800, height: 500 }, rect: { left: 476, top: 256 }, viewport: { width: 2560, height: 1440 } }}
    `(
      'keeps a user-placed frame held by its $held inside every viewport',
      ({ frame }) => {
        const offScreen = viewports.filter((viewport) => {
          const { left, top, right, bottom } = frameRect(viewport, frame);

          return (
            left < 0 ||
            top < 0 ||
            right > viewport.width ||
            bottom > viewport.height
          );
        });

        expect(offScreen).toEqual([]);
      }
    );

    it('never shrinks below the usable minimum', () => {
      const tooSmall = viewports.filter(
        ({ width, height }) =>
          frameGeometry({ width, height }).size.height <
          Math.min(MIN_HEIGHT, height)
      );

      expect(tooSmall).toEqual([]);
    });
  });
});
