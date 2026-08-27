// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

// Gap kept between the frame and the viewport edges, until the user moves it
const VIEWPORT_MARGIN = 24;

// How far the frame's right edge is from the launcher's right edge
const LAUNCHER_GAP = 16;

// Size the frame opens at, before the user resizes it
const PREFERRED_WIDTH = 384;
const PREFERRED_HEIGHT = 650;

export const MIN_WIDTH = 300;
export const MIN_HEIGHT = 400;

// Width breakpoint below which the frame takes the whole viewport
const MOBILE_BREAKPOINT = 640;

// Keeps the frame the distance it was from whichever window edge it was nearer when the user let go.
// Runs once per axis: start and end edges are left and right horizontally, top and bottom vertically.
const refitAxis = (
  fromStartEdgeWhenPlaced,
  sizeWhenPlaced,
  windowSizeWhenPlaced,
  windowSize
) => {
  const fromEndEdgeWhenPlaced =
    windowSizeWhenPlaced - (fromStartEdgeWhenPlaced + sizeWhenPlaced);
  const startNearSameEdge =
    fromStartEdgeWhenPlaced <= fromEndEdgeWhenPlaced
      ? fromStartEdgeWhenPlaced
      : windowSize - fromEndEdgeWhenPlaced - sizeWhenPlaced;
  const sizeThatFits = Math.min(sizeWhenPlaced, windowSize);

  return {
    start: Math.min(Math.max(startNearSameEdge, 0), windowSize - sizeThatFits),
    size: sizeThatFits,
  };
};

// Always measured from where the user left the frame, never from the last
// clamp, so shrinking the window and growing it back gives their size back.
const refitPlacedFrame = (
  viewport,
  origin,
  { size: sizeWhenPlaced, rect: rectWhenPlaced, viewport: windowWhenPlaced }
) => {
  const horizontal = refitAxis(
    rectWhenPlaced.left,
    sizeWhenPlaced.width,
    windowWhenPlaced.width,
    viewport.width
  );
  const vertical = refitAxis(
    rectWhenPlaced.top,
    sizeWhenPlaced.height,
    windowWhenPlaced.height,
    viewport.height
  );

  return {
    size: { width: horizontal.size, height: vertical.size },
    position: {
      x: horizontal.start - origin.x,
      y: vertical.start - origin.y,
    },
  };
};

// A window too narrow or too short for a floating chat gets the whole screen
// instead: nothing to dodge, nowhere to drag it to.
const fitFullViewport = ({ width, height }, origin) => ({
  size: { width, height },
  position: { x: -origin.x, y: -origin.y },
  minWidth: Math.min(MIN_WIDTH, width),
  minHeight: Math.min(MIN_HEIGHT, height),
  maxWidth: width,
  maxHeight: height,
});

// Where the frame belongs, relative to the measured popover origin.
// - above the launcher by default
// - shrinks to keep the drag handle in screen
// - keeps the user's size and position
// - fills the viewport on small screens
export const computeFrameGeometry = (
  viewport,
  origin,
  frameWhenPlaced = null
) => {
  const spaceBesideLauncher = origin.x - VIEWPORT_MARGIN;
  const spaceAboveLauncher = origin.y - VIEWPORT_MARGIN;

  if (viewport.width < MOBILE_BREAKPOINT || spaceAboveLauncher < MIN_HEIGHT) {
    return fitFullViewport(viewport, origin);
  }

  if (frameWhenPlaced) {
    return {
      ...refitPlacedFrame(viewport, origin, frameWhenPlaced),
      minWidth: MIN_WIDTH,
      minHeight: MIN_HEIGHT,
      maxWidth: viewport.width,
      maxHeight: viewport.height,
    };
  }

  const width = Math.min(PREFERRED_WIDTH, spaceBesideLauncher);
  const height = Math.min(PREFERRED_HEIGHT, spaceAboveLauncher);

  return {
    size: { width, height },
    position: { x: -(width + LAUNCHER_GAP), y: -height },
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    maxWidth: spaceBesideLauncher,
    maxHeight: spaceAboveLauncher,
  };
};

export const readViewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});
