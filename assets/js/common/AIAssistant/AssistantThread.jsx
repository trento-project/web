import React from 'react';
import {
  ActionBarPrimitive,
  AuiIf,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
} from '@assistant-ui/react';
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown';
import '@assistant-ui/react-markdown/styles/dot.css';
import remarkGfm from 'remark-gfm';
import Spinner from '@common/Spinner';

function CustomMarkdownText(props) {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-md"
      {...props}
    />
  );
}

export function AssistantThread() {
  return (
    <ThreadPrimitive.Root
      className="relative flex h-full flex-col bg-transparent text-sm"
      style={{
        '--thread-max-width': '44rem',
        '--accent-color': '#30ba78',
        '--accent-foreground': '#ffffff',
      }}
    >
      <ChatHeader />
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-4 pt-4 pb-4"
      >
        <AuiIf condition={({ thread }) => thread.isEmpty}>
          <ThreadWelcome />
        </AuiIf>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />

        <ThreadSuggestions />
        <div className="sticky bottom-0 mx-auto mt-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible bg-gray-50 pt-4">
          <ThreadPrimitive.ViewportFooter className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible pb-4">
            <Composer />
          </ThreadPrimitive.ViewportFooter>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}

function ChatHeader() {
  const aui = useAui();

  return (
    <div className="drag-handle flex items-center justify-between bg-jungle-green-500 px-4 py-4 text-white cursor-move">
      <div className="flex items-center gap-3">
        <div className="size-2 rounded-full bg-white opacity-90 ml-1" />
        <div className="flex flex-col">
          <span className="font-semibold text-lg leading-none">Liz</span>
          <span className="text-xs opacity-90 mt-1">Online</span>
        </div>
      </div>
      <button
        onPointerDown={(e) => e.stopPropagation()}
      onClick={() => aui.threads().switchToNewThread()}
        className="flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
      >
        New chat
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
    </div>
  );
}

function ThreadWelcome() {
  return (
    <div className="mx-auto w-full max-w-[var(--thread-max-width)] py-2">
      <div className="rounded-lg bg-gray-200/60 px-5 py-4 text-gray-800 text-base">
        Ready to answer any questions you have.
      </div>
    </div>
  );
}

function Composer() {
  return (
    <ComposerPrimitive.Root className="relative flex w-full flex-col">
      <ComposerPrimitive.AttachmentDropzone className="relative flex w-full flex-col rounded-md border border-gray-300 bg-white outline-none transition-all focus-within:border-jungle-green-500 focus-within:ring-1 focus-within:ring-jungle-green-500">
        <ComposerPrimitive.Input
          placeholder="Ask my anything..."
          className="max-h-32 min-h-12 w-full resize-none bg-transparent px-4 py-3 pr-20 text-base outline-none placeholder:text-gray-400 focus-visible:ring-0"
          rows={1}
          aria-label="Message input"
        />
        <ComposerAction />
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
}

function ComposerAction() {
  return (
    <div className="absolute right-2 bottom-1.5">
      <AuiIf condition={({ thread }) => !thread.isRunning}>
        <ComposerPrimitive.Send asChild>
          <button
            type="submit"
            className="rounded-md bg-jungle-green-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-jungle-green-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Send message"
          >
            Send
          </button>
        </ComposerPrimitive.Send>
      </AuiIf>
    </div>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root
      className="mx-auto w-full max-w-[var(--thread-max-width)] py-2 fade-in slide-in-from-bottom-1 animate-in duration-150"
      data-role="user"
    >
      <div className="rounded-lg bg-[#e8f5ef] px-5 py-4">
        <div className="mb-1.5 font-semibold text-[#208b57] text-base">You</div>
        <div className="break-words text-gray-800 text-base">
          <MessagePrimitive.Parts />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root
      className="mx-auto w-full max-w-[var(--thread-max-width)] py-2 fade-in slide-in-from-bottom-1 animate-in duration-150"
      data-role="assistant"
    >
      <div className="rounded-lg bg-white px-5 py-4 shadow-sm">
        <div className="break-words text-gray-800 text-base leading-relaxed">
            <MessagePrimitive.Parts
              components={{
                Text: CustomMarkdownText,
              }}
            />

            <MessageError />
            <AuiIf
              condition={({ thread, message }) =>
                thread.isRunning && message.content.length === 0
              }
            >
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <Spinner />
                <span className="text-sm">Thinking...</span>
              </div>
            </AuiIf>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}

function ThreadSuggestions() {
  return (
    <AuiIf condition={({ thread }) => !thread.isRunning && !thread.isEmpty}>
      <div className="mx-auto mt-4 flex w-full max-w-[var(--thread-max-width)] flex-wrap gap-2 px-2 mb-2" />
    </AuiIf>
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
