// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useId, useState } from 'react';
import { EOS_FULLSCREEN, EOS_OPEN_IN_NEW } from 'eos-icons-react';

import DiagramModal from './DiagramModal';
import DiagramViewport, { DiagramButton } from './DiagramViewport';
import { openDiagramInNewTab } from './standaloneDiagram';

// The assistant streams a fence in a token at a time, so most intermediate
// states are unparseable. Wait for a pause before spending a render on one.
export const RENDER_DEBOUNCE_MS = 300;

// mermaid is by far the heaviest thing we bundle — d3, dagre and cytoscape
// ride along, and inlining it doubles `trento.js` (3.1 MB → 6.6 MB minified).
//
// `assets/build.js` sets `splitting: true`, so this `import()` becomes a chunk
// fetched the first time a diagram appears instead of a page-load cost for
// everyone. Turning splitting off silently puts those megabytes back.
//
// The module is import-cached and `initialize` only assigns config, so
// repeating both per mount costs nothing worth memoizing.
async function loadMermaid() {
  const { default: mermaid } = await import('mermaid');

  mermaid.initialize({
    startOnLoad: false,
    // Diagram source is model-generated. `strict` runs every label through
    // DOMPurify and drops click handlers. Do not relax it — `loose` and
    // `antiscript` both re-enable inline HTML in labels.
    securityLevel: 'strict',
    theme: 'default',
    fontFamily: 'Lato, sans-serif',
  });

  return mermaid;
}

function MermaidDiagram({ components: { Pre, Code }, code }) {
  // mermaid uses the id in a CSS selector and `useId` returns colons.
  const id = `mermaid-${useId().replace(/:/g, '')}`;
  const [svg, setSvg] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const source = code.replace(/\n$/, '');

  const expand = useCallback(() => setExpanded(true), []);
  const collapse = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      const mermaid = await loadMermaid();

      if (cancelled) return;

      const parsed = await mermaid.parse(source, { suppressErrors: true });

      if (cancelled || !parsed) return;

      try {
        const { svg: rendered } = await mermaid.render(id, source);

        if (!cancelled) setSvg(rendered);
      } catch {
        // A diagram that parses can still fail to lay out. Leaving the
        // previous state alone keeps the source — or the last good
        // diagram — on screen instead of blanking the message.
      }
    }, RENDER_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, source]);

  // Until the first successful render — and for anything that never becomes
  // a valid diagram — this is just a fenced block like any other.
  if (!svg) {
    return (
      <Pre>
        <Code>{source}</Code>
      </Pre>
    );
  }

  // A diagram gets far less room in the chat window than it wants, so the
  // inline copy is a pan/zoom viewport and the two escape hatches — a modal
  // over the whole page, and the raw SVG in its own tab — sit next to the
  // zoom controls.
  return (
    <>
      <DiagramViewport
        svg={svg}
        className="my-5 h-72"
        actions={
          <>
            <DiagramButton
              label="Expand diagram"
              icon={EOS_FULLSCREEN}
              onClick={expand}
            />
            <DiagramButton
              label="Open diagram in a new tab"
              icon={EOS_OPEN_IN_NEW}
              onClick={() => openDiagramInNewTab(svg)}
            />
          </>
        }
      />
      <DiagramModal open={expanded} svg={svg} onClose={collapse} />
    </>
  );
}

export default MermaidDiagram;
