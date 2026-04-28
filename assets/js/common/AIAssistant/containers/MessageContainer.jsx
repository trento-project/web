import React from 'react';
import { ErrorPrimitive, MessagePrimitive } from '@assistant-ui/react';
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown';
import '@assistant-ui/react-markdown/styles/dot.css';
import remarkGfm from 'remark-gfm';

import { MessageBubble } from '../components/MessageBubble';
import { StatusIndicatorContainer } from './StatusIndicatorContainer';

const ROOT_CLASS_NAME =
  'mx-auto w-full max-w-[var(--thread-max-width)] py-2 fade-in slide-in-from-bottom-1 animate-in duration-150';

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

export function UserMessageContainer() {
  return (
    <MessagePrimitive.Root className={ROOT_CLASS_NAME} data-role="user">
      <MessageBubble variant="user">
        <MessagePrimitive.Parts />
      </MessageBubble>
    </MessagePrimitive.Root>
  );
}

export function AssistantMessageContainer() {
  return (
    <MessagePrimitive.Root className={ROOT_CLASS_NAME} data-role="assistant">
      <MessageBubble variant="assistant">
        <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
        <MessageError />
        <StatusIndicatorContainer />
      </MessageBubble>
    </MessagePrimitive.Root>
  );
}
