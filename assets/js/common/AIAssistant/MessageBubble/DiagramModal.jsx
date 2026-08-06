// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { EOS_CLOSE, EOS_OPEN_IN_NEW } from 'eos-icons-react';

import DiagramViewport, { DiagramButton } from './DiagramViewport';
import { openDiagramInNewTab } from './standaloneDiagram';

// `@common/Modal` is the app's dialog, but it pins itself to `z-50`, always
// renders a title and pads its panel for form content. The chat window sits at
// `z-[101]`, so a diagram opened from it has to outrank that — and it wants the
// whole panel, edge to edge.
function DiagramModal({ open, svg, onClose }) {
  // Both this dialog and the chat window's popover watch the document for
  // Escape, so one press would otherwise dismiss the conversation along with
  // the diagram. Settling it here — before the key reaches the document — puts
  // the user back in the chat they opened the diagram from.
  const closeOnEscape = (event) => {
    if (event.key !== 'Escape') return;

    event.stopPropagation();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={closeOnEscape}
      className="relative z-[110]"
    >
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-6">
        <DialogPanel className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
          <DiagramViewport
            svg={svg}
            className="flex-1 rounded-none border-0"
            actions={
              <>
                <DiagramButton
                  label="Open diagram in a new tab"
                  icon={EOS_OPEN_IN_NEW}
                  onClick={() => openDiagramInNewTab(svg)}
                />
                <DiagramButton
                  label="Close diagram"
                  icon={EOS_CLOSE}
                  onClick={onClose}
                />
              </>
            }
          />
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default DiagramModal;
