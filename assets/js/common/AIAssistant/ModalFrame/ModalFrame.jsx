// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { forwardRef } from 'react';
import { Rnd } from 'react-rnd';
import { Link } from 'react-router';
import { EOS_CHAT_BUBBLE_OUTLINED } from 'eos-icons-react';
import { AssistantModalPrimitive } from '@assistant-ui/react';

import Button from '@common/Button';
import Tooltip from '@common/Tooltip';

// forwardRef + `{...props}` spread are required so the
// enabled instance works inside `AssistantModalPrimitive.Trigger asChild`
// (which injects onClick / data-state / aria-expanded + a ref).
const ChatboxTrigger = forwardRef(({ disabled = false, ...props }, ref) => (
  // `{...props}` first so injected behavior (onClick / data-state / aria-expanded)
  // is kept, but the presentational props below win — notably `type="fab"`, which
  // `Trigger asChild` would otherwise overwrite with the HTML `type="button"`.
  <Button
    ref={ref}
    {...props}
    type="fab"
    size="none"
    className="size-full"
    disabled={disabled}
    data-testid={
      disabled ? 'ai-assistant-trigger-disabled' : 'ai-assistant-trigger'
    }
    aria-label={disabled ? 'AI Assistant is disabled' : 'Open AI Assistant'}
  >
    <EOS_CHAT_BUBBLE_OUTLINED className="fill-white" />
  </Button>
));

ChatboxTrigger.displayName = 'ChatboxTrigger';

const disabledTooltipContent = (
  <span className="text-center">
    AI Assistant is disabled. <br />
    Please check{' '}
    <Link
      to="/profile"
      className="underline hover:opacity-75 text-jungle-green-500"
    >
      Profile
    </Link>{' '}
    for Settings.
  </span>
);

function ModalFrame({
  open,
  onOpenChange,
  disabled = false,
  initialSize = { width: 384, height: 650 },
  initialPosition = { x: -400, y: -650 },
  minWidth = 300,
  minHeight = 400,
  children,
}) {
  return (
    <AssistantModalPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AssistantModalPrimitive.Anchor className="fixed right-6 bottom-20 size-12 z-40">
        {disabled ? (
          <Tooltip
            content={disabledTooltipContent}
            place="left"
            mouseLeaveDelay={0.3}
          >
            <ChatboxTrigger disabled />
          </Tooltip>
        ) : (
          <AssistantModalPrimitive.Trigger asChild>
            <ChatboxTrigger />
          </AssistantModalPrimitive.Trigger>
        )}
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

export default ModalFrame;
