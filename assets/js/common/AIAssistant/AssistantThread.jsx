import React from 'react';
import { EOS_CLOSE } from 'eos-icons-react';
import {
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
import { useAIConnectionStatus } from './AssistantChatProvider';

function CustomMarkdownText(props) {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-md"
      {...props}
    />
  );
}

export function AssistantThread({ onClose }) {
  return (
    <ThreadPrimitive.Root
      className="relative flex h-full flex-col bg-white text-sm"
      style={{
        '--thread-max-width': '44rem',
        '--accent-color': '#2fb371',
        '--accent-foreground': '#ffffff',
      }}
    >
      <ChatHeader onClose={onClose} />
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-6 pt-4 pb-6"
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
        <div className="sticky bottom-0 mx-auto mt-auto flex w-full max-w-[var(--thread-max-width)] flex-col overflow-visible bg-white pt-4">
          <ThreadPrimitive.ViewportFooter className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col overflow-visible">
            <Composer />
          </ThreadPrimitive.ViewportFooter>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}

function ChatHeader({ onClose }) {
  const aui = useAui();
  const connectionStatus = useAIConnectionStatus();

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  const statusText = isConnected
    ? 'Online'
    : isConnecting
    ? 'Connecting...'
    : 'Offline';

  return (
    <div className="drag-handle flex items-center justify-between bg-[#2fb371] px-5 py-4 text-white cursor-move">
      <div className="flex items-center gap-3">
        <div
          className={`w-2.5 h-2.5 rounded-full mt-1 shadow-sm ml-1 ${
            isConnected
              ? 'bg-white'
              : isConnecting
              ? 'bg-yellow-300 animate-pulse'
              : 'bg-red-400'
          }`}
        />
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-lg">Liz</span>
          <span className="text-sm font-medium opacity-95">{statusText}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => aui.threads().switchToNewThread()}
          className="text-sm font-medium hover:underline cursor-pointer"
        >
          New chat
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
          aria-label="Close"
        >
          <EOS_CLOSE className="h-6 w-6 fill-current" />
        </button>
      </div>
    </div>
  );
}

function ThreadWelcome() {
  return (
    <div className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-6 pt-32 pb-2">
      <div className="text-[22px] leading-snug text-gray-500">
        <div className="font-bold text-gray-600">Hi, I&apos;m Liz.</div>
        <div>How can I help you today?</div>
      </div>

      <div className="flex flex-col gap-3">
        <ThreadPrimitive.Suggestion
          prompt="What is the API key for adding agents?"
          className="text-left bg-[#f8f9fa] border border-gray-200 rounded-lg p-3.5 text-gray-500 hover:bg-gray-100 transition-colors text-[15px]"
        >
          <span className="font-bold text-gray-600">What is the API key</span>{' '}
          for adding agents?
        </ThreadPrimitive.Suggestion>
        <ThreadPrimitive.Suggestion
          prompt="What is the check results that was run recently?"
          className="text-left bg-[#f8f9fa] border border-gray-200 rounded-lg p-3.5 text-gray-500 hover:bg-gray-100 transition-colors text-[15px]"
        >
          <span className="font-bold text-gray-600">
            What is the check results
          </span>{' '}
          that was run recently?
        </ThreadPrimitive.Suggestion>
      </div>
    </div>
  );
}

function Composer() {
  const connectionStatus = useAIConnectionStatus();
  const isConnected = connectionStatus === 'connected';
  const placeholder = isConnected
    ? "How can I help you?"
    : connectionStatus === 'connecting'
    ? "Connecting..."
    : "Offline - waiting to reconnect...";

  return (
    <ComposerPrimitive.Root className="relative flex w-full flex-col">
      <ComposerPrimitive.AttachmentDropzone className="relative flex w-full flex-col outline-none">
        <ComposerPrimitive.Input
          placeholder={placeholder}
          disabled={!isConnected}
          className="w-full border border-gray-300 rounded-lg p-4 text-gray-700 resize-none h-[130px] focus:outline-none focus:border-[#2fb371] focus:ring-1 focus:ring-[#2fb371] placeholder-gray-400 text-lg font-medium bg-white shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
          aria-label="Message input"
        />
      </ComposerPrimitive.AttachmentDropzone>
      <div className="flex justify-between items-center w-full mt-4">
        <div className="text-sm text-gray-400 leading-tight">
          AI assistants can make mistakes.
          <br />
          <a
            href="https://documentation.suse.com/sles-sap/trento/html/SLES-SAP-trento/index.html"
            className="underline hover:text-gray-500"
          >
            Learn more
          </a>
        </div>
        <ComposerAction />
      </div>
    </ComposerPrimitive.Root>
  );
}

function ComposerAction() {
  const connectionStatus = useAIConnectionStatus();
  const isConnected = connectionStatus === 'connected';

  return (
    <AuiIf condition={({ thread }) => !thread.isRunning}>
      <ComposerPrimitive.Send asChild>
        <button
          type="submit"
          disabled={!isConnected}
          className="rounded-lg bg-[#2fb371] px-6 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#279c61] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Send message"
          title={!isConnected ? 'Waiting for connection...' : 'Send message'}
        >
          Send
        </button>
      </ComposerPrimitive.Send>
    </AuiIf>
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
      <div className="bg-white px-5 py-4">
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
