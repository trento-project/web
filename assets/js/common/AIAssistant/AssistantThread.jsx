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
import { STATUS } from './status';

function ThreadBanner({ children }) {
  return (
    <div
      className="mb-3 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
      role="alert"
    >
      {children}
    </div>
  );
}

function ClearedBanner() {
  return (
    <ThreadBanner>
      Your AI settings were cleared. This conversation is now read-only.
      Configure AI in your{' '}
      <Link
        to="/profile"
        className="underline hover:opacity-75 text-jungle-green-500"
      >
        Profile
      </Link>{' '}
      to continue.
    </ThreadBanner>
  );
}

function RestoredBanner() {
  return (
    <ThreadBanner>
      A new AI configuration is available. Start a new chat to continue.
    </ThreadBanner>
  );
}

function AssistantThread({
  connectionStatus,
  isEmpty = false,
  isRunning = false,
  onNewThread = noop,
  onClose = noop,
  status = STATUS.OK,
}) {
  const inputDisabled = status !== STATUS.OK;
  const newChatDisabled = status === STATUS.CLEARED;
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
        status={status}
        onNewChat={onNewThread}
        onClose={onClose}
        disabled={newChatDisabled}
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
          {status === STATUS.CLEARED && <ClearedBanner />}
          {status === STATUS.RESTORED && <RestoredBanner />}
          <PromptComposer
            connectionStatus={connectionStatus}
            isRunning={isRunning}
            disabled={inputDisabled}
          />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}

export default AssistantThread;
