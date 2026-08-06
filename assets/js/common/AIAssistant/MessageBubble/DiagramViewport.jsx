// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { EOS_CROP_FREE, EOS_ZOOM_IN, EOS_ZOOM_OUT } from 'eos-icons-react';

import Button from '@common/Button';

const SVG_NS = 'http://www.w3.org/2000/svg';

const SCALE_EXTENT = [0.25, 8];
const ZOOM_STEP = 1.4;
// Leave a margin around a fitted diagram so nothing touches the frame.
const FIT_PADDING = 0.95;

// d3 already rides into the bundle on mermaid's dependency tree. Importing it
// dynamically here keeps it in the same lazily loaded chunk instead of pulling
// a second copy into the entry point.
async function loadD3() {
  const [{ select }, { zoom, zoomIdentity }] = await Promise.all([
    import('d3-selection'),
    import('d3-zoom'),
  ]);

  return { select, zoom, zoomIdentity };
}

// A wheel over the diagram scrolls the conversation, as it does over any other
// message. Zooming is opt-in with the modifier browsers already use for zoom.
// Everything else — drag to pan, touch pinch — is d3's default.
const zoomFilter = (event) =>
  event.type === 'wheel' ? event.ctrlKey || event.metaKey : !event.button;

// mermaid sizes the root element to the diagram's natural dimensions. Inside a
// viewport the viewport decides, and the transform we apply lives on a single
// wrapping group so panning never touches mermaid's own markup.
function prepareSvg(svgEl) {
  const layer = document.createElementNS(SVG_NS, 'g');

  while (svgEl.firstChild) layer.appendChild(svgEl.firstChild);
  svgEl.appendChild(layer);

  svgEl.setAttribute('width', '100%');
  svgEl.setAttribute('height', '100%');
  svgEl.style.maxWidth = 'none';
  svgEl.style.display = 'block';

  return layer;
}

export function DiagramButton({ label, icon: Icon, onClick }) {
  return (
    <Button
      type="icon"
      size="none"
      className="p-1 text-gray-600 hover:text-gray-900"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon className="h-5 w-5 fill-current" />
    </Button>
  );
}

function DiagramViewport({ svg, className, actions = null }) {
  const containerRef = useRef(null);
  // Populated once d3 has loaded, so every control has to tolerate its absence.
  const controlsRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    // mermaid sanitizes its own output under `securityLevel: 'strict'`. React
    // never owns these nodes: the effect injects them and the effect drops
    // them, which is also what lets us reparent them for the transform.
    container.innerHTML = svg;

    const svgEl = container.querySelector('svg');

    if (!svgEl) return undefined;

    const layer = prepareSvg(svgEl);

    let cancelled = false;
    let detach = () => {};

    loadD3().then(({ select, zoom, zoomIdentity }) => {
      if (cancelled) return;

      const selection = select(svgEl);
      const behavior = zoom()
        .scaleExtent(SCALE_EXTENT)
        .filter(zoomFilter)
        .on('zoom', (event) =>
          layer.setAttribute('transform', event.transform)
        );

      selection.call(behavior);

      const fit = () => {
        const { width, height } = container.getBoundingClientRect();
        // jsdom has no layout engine and `getBBox` is unimplemented there.
        const bounds =
          typeof layer.getBBox === 'function' ? layer.getBBox() : null;

        if (!bounds || !bounds.width || !bounds.height || !width || !height) {
          selection.call(behavior.transform, zoomIdentity);
          return;
        }

        // Cap at 1: a diagram smaller than its viewport is shown at its own
        // size rather than blown up to fill the frame.
        const scale =
          Math.min(width / bounds.width, height / bounds.height, 1) *
          FIT_PADDING;
        const x = (width - bounds.width * scale) / 2 - bounds.x * scale;
        const y = (height - bounds.height * scale) / 2 - bounds.y * scale;

        selection.call(
          behavior.transform,
          zoomIdentity.translate(x, y).scale(scale)
        );
      };

      controlsRef.current = {
        scaleBy: (factor) => behavior.scaleBy(selection, factor),
        fit,
      };

      fit();

      detach = () => {
        selection.on('.zoom', null);
        controlsRef.current = null;
      };
    });

    return () => {
      cancelled = true;
      detach();
      container.innerHTML = '';
    };
  }, [svg]);

  const zoomIn = useCallback(() => controlsRef.current?.scaleBy(ZOOM_STEP), []);
  const zoomOut = useCallback(
    () => controlsRef.current?.scaleBy(1 / ZOOM_STEP),
    []
  );
  const fitToViewport = useCallback(() => controlsRef.current?.fit(), []);

  return (
    <div
      className={classNames(
        'relative overflow-hidden rounded border border-gray-200 bg-white',
        className
      )}
      data-testid="diagram-viewport"
    >
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        data-testid="diagram-surface"
      />
      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-gray-200 bg-white/90 p-1 shadow-sm">
        <DiagramButton label="Zoom out" icon={EOS_ZOOM_OUT} onClick={zoomOut} />
        <DiagramButton label="Zoom in" icon={EOS_ZOOM_IN} onClick={zoomIn} />
        <DiagramButton
          label="Fit diagram"
          icon={EOS_CROP_FREE}
          onClick={fitToViewport}
        />
        {actions}
      </div>
    </div>
  );
}

export default DiagramViewport;
