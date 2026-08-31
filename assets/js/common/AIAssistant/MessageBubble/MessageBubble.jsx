// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useRef } from 'react';
import {
  ActionBarPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
} from '@assistant-ui/react';
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown';
import remarkGfm from 'remark-gfm';

import AgentProgressIndicator from '../AgentProgressIndicator';
import CodeBlock from './CodeBlock';
import CopyReplyButton from './CopyReplyButton';

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
      className="aui-md prose max-w-none"
      components={{
        SyntaxHighlighter: CodeBlock,
        table: ({ node, ...tableProps }) => (
          <div className="overflow-x-auto">
            <table {...tableProps} />
          </div>
        ),
      }}
      smooth={false}
      {...props}
    />
  );
}

function MessageError() {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="mt-2 rounded-md bg-red-50 p-3 text-red-500 text-sm">
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
  // `CopyReplyButton` copies this subtree's HTML
  const replyRef = useRef(null);

  return (
    <MessagePrimitive.Root className={ROOT_CLASS_NAME} data-role="assistant">
      <MessageBubbleView variant="assistant">
        <div ref={replyRef} data-testid="assistant-reply">
          <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
        </div>
        <AgentProgressIndicator isRunning={isRunning} />
        <ActionBarPrimitive.Root className="mt-1 flex">
          <CopyReplyButton contentRef={replyRef} />
        </ActionBarPrimitive.Root>
      </MessageBubbleView>
      <MessageError />
    </MessagePrimitive.Root>
  );
}
