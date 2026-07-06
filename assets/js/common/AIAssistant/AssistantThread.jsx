// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { noop } from 'lodash';
import { Link } from 'react-router';
import { ThreadPrimitive } from '@assistant-ui/react';

import ChatHeader from './ChatHeader';
import PromptComposer from './PromptComposer';
import { AssistantMessage, UserMessage } from './MessageBubble';
import ThreadWelcome from './ThreadWelcome';

function ClearedBanner() {
  return (
    <div
      className="mb-3 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
      role="alert"
    >
      Your AI settings were cleared. This conversation is now read-only.
      Configure AI in your{' '}
      <Link
        to="/profile"
        className="underline hover:opacity-75 text-jungle-green-500"
      >
        Profile
      </Link>{' '}
      to continue.
    </div>
  );
}

function AssistantThread({
  connectionStatus,
  isEmpty = false,
  isRunning = false,
  onNewThread = noop,
  onClose = noop,
  disabled = false,
}) {
  return (
    <ThreadPrimitive.Root
      className="relative flex h-full flex-col bg-white text-sm"
      style={{
        '--thread-max-width': '44rem',
        '--accent-color': '#2fb371',
        '--accent-foreground': '#ffffff',
      }}
    >
      <ChatHeader
        connectionStatus={connectionStatus}
        onNewChat={onNewThread}
        onClose={onClose}
        disabled={disabled}
      />
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto scroll-smooth px-6 pt-4"
      >
        {isEmpty && <ThreadWelcome />}

        <ThreadPrimitive.Messages>
          {({ message }) => {
            switch (message.role) {
              case 'user':
                return <UserMessage />;
              case 'assistant':
                return <AssistantMessage isRunning={isRunning} />;
              default:
                return null;
            }
          }}
        </ThreadPrimitive.Messages>
        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mx-auto mt-auto flex w-full max-w-[var(--thread-max-width)] flex-col bg-white pt-4 pb-4">
          {disabled && <ClearedBanner />}
          <PromptComposer
            connectionStatus={connectionStatus}
            isRunning={isRunning}
            disabled={disabled}
          />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}

export default AssistantThread;
