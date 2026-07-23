// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { MemoryRouter } from 'react-router';
import ModalFrame from './ModalFrame';

export default {
  title: 'Components/AIAssistant/ModalFrame',
  component: ModalFrame,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        iframeHeight: 700,
      },
    },
  },
};

function PlaceholderContent() {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="drag-handle bg-[#2fb371] px-5 py-4 text-white cursor-move font-bold">
        Liz · placeholder header (drag me)
      </div>
      <div className="flex-1 px-6 py-4 text-gray-500">
        ModalFrame content slot — chat thread renders here in the real app.
      </div>
    </div>
  );
}

export const Open = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <ModalFrame open={open} onOpenChange={setOpen}>
        <PlaceholderContent />
      </ModalFrame>
    );
  },
};

export const Closed = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <ModalFrame open={open} onOpenChange={setOpen}>
        <PlaceholderContent />
      </ModalFrame>
    );
  },
};

export const Disabled = {
  name: 'Disabled (no AI configuration)',
  render: () => (
    <MemoryRouter>
      <ModalFrame open={false} onOpenChange={() => {}} disabled>
        <PlaceholderContent />
      </ModalFrame>
    </MemoryRouter>
  ),
};
