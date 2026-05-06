// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Rnd } from 'react-rnd';
import { EOS_CHAT_BUBBLE_OUTLINED } from 'eos-icons-react';
import { AssistantModalPrimitive } from '@assistant-ui/react';

import Button from '@common/Button';

const defaultTrigger = (
  <Button
    type="fab"
    size="none"
    className="size-full"
    data-testid="ai-assistant-trigger"
    aria-label="Open AI Assistant"
  >
    <EOS_CHAT_BUBBLE_OUTLINED className="fill-white" />
  </Button>
);

export function ModalFrame({
  open,
  onOpenChange,
  trigger = defaultTrigger,
  initialSize = { width: 384, height: 650 },
  initialPosition = { x: -400, y: -650 },
  minWidth = 300,
  minHeight = 400,
  children,
}) {
  return (
    <AssistantModalPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AssistantModalPrimitive.Anchor className="fixed right-6 bottom-20 size-12 z-40">
        <AssistantModalPrimitive.Trigger asChild>
          {trigger}
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>

      <AssistantModalPrimitive.Content
        sideOffset={16}
        className="z-[101] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <Rnd
          bounds="window"
          default={{ ...initialSize, ...initialPosition }}
          minWidth={minWidth}
          minHeight={minHeight}
          maxWidth={window.innerWidth - 100}
          maxHeight={window.innerHeight - 200}
          dragHandleClassName="drag-handle"
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-2xl flex flex-col overflow-hidden"
        >
          {children}
        </Rnd>
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
}
