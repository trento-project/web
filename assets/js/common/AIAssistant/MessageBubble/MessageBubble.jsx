// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { ErrorPrimitive, MessagePrimitive } from '@assistant-ui/react';
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown';
import '@assistant-ui/react-markdown/styles/dot.css';
import remarkGfm from 'remark-gfm';

import { AgentProgressIndicator } from '../AgentProgressIndicator';

const ROOT_CLASS_NAME =
  'mx-auto w-full max-w-[var(--thread-max-width)] py-2 fade-in slide-in-from-bottom-1 animate-in duration-150';

function MessageBubbleView({ variant, children }) {
  if (variant === 'user') {
    return (
      <div className="rounded-lg bg-[#e8f5ef] px-5 py-4">
        <div className="mb-1.5 font-semibold text-[#208b57] text-base">You</div>
        <div className="break-words text-gray-800 text-base">{children}</div>
      </div>
    );
  }

  return (
    <div className="bg-white px-5 py-4">
      <div className="break-words text-gray-800 text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function MarkdownText(props) {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-md"
      {...props}
    />
  );
}

function MessageError() {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
}

export function UserMessage() {
  return (
    <MessagePrimitive.Root className={ROOT_CLASS_NAME} data-role="user">
      <MessageBubbleView variant="user">
        <MessagePrimitive.Parts />
      </MessageBubbleView>
    </MessagePrimitive.Root>
  );
}

export function AssistantMessage({ isRunning }) {
  return (
    <MessagePrimitive.Root className={ROOT_CLASS_NAME} data-role="assistant">
      <MessageBubbleView variant="assistant">
        <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
        <MessageError />
        <AgentProgressIndicator isRunning={isRunning} />
      </MessageBubbleView>
    </MessagePrimitive.Root>
  );
}
