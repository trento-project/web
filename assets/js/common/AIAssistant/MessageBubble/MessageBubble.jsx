// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { ErrorPrimitive, MessagePrimitive } from '@assistant-ui/react';
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown';
import remarkGfm from 'remark-gfm';

import AgentProgressIndicator from '../AgentProgressIndicator';
import CodeBlock from './CodeBlock';
import MermaidDiagram from './MermaidDiagram';

const ROOT_CLASS_NAME =
  'mx-auto w-full max-w-[var(--thread-max-width)] py-2 fade-in slide-in-from-bottom-1 animate-in duration-150';

// `@assistant-ui/react-markdown` renders bare HTML elements with no classes,
// and tailwind's preflight strips heading sizes, list markers and block
// margins. `prose` puts them back; `max-w-none` lets it fill the bubble.
const MARKDOWN_CLASS_NAME = 'aui-md prose max-w-none';

const MARKDOWN_COMPONENTS = { SyntaxHighlighter: CodeBlock };

// A ```mermaid fence is a diagram, not source to highlight. Everything else
// keeps falling through to `CodeBlock`.
const MARKDOWN_COMPONENTS_BY_LANGUAGE = {
  mermaid: { SyntaxHighlighter: MermaidDiagram },
};

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
      className={MARKDOWN_CLASS_NAME}
      components={MARKDOWN_COMPONENTS}
      componentsByLanguage={MARKDOWN_COMPONENTS_BY_LANGUAGE}
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
  return (
    <MessagePrimitive.Root className={ROOT_CLASS_NAME} data-role="assistant">
      <MessageBubbleView variant="assistant">
        <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
        <AgentProgressIndicator isRunning={isRunning} />
      </MessageBubbleView>
      <MessageError />
    </MessagePrimitive.Root>
  );
}
