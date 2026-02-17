import React from "react";
import {
  ActionBarPrimitive,
  AuiIf,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
} from '@assistant-ui/react';
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import '@assistant-ui/react-markdown/styles/dot.css';
import remarkGfm from 'remark-gfm';
import { TooltipIconButton } from '@common/AssistantChat/TooltipIconButton';
import Button from '@common/Button';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BotIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  LoaderIcon,
  RefreshCwIcon,
  SquareIcon,
  UserIcon
} from 'lucide-react';
import { ToolFallback } from './ToolFallback';

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
      className="relative flex h-full flex-col bg-background text-sm"
      style={{
        '--thread-max-width': '44rem',
        '--accent-color': '#30ba78',
        '--accent-foreground': '#ffffff',
      }}
    >
      <NewThreadButton />
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-4 pt-4"
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
        <div className="sticky bottom-0 mx-auto mt-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible bg-white">
          <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mt-10 mx-auto mt-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible rounded-t-3xl pb-4">

            {/* <ThreadScrollToBottom /> */}

            <Composer />

          </ThreadPrimitive.ViewportFooter>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}

function NewThreadButton() {
  const aui = useAui();

  return (
    <Button
      onClick={() => aui.threads().switchToNewThread()}
      type="primary-white-fit"
      size="small"
      className="ml-auto mr-4 mt-4 flex items-center gap-2"
    >
      Clear
    </Button>
  );
}

function ThreadWelcome() {
  return (
    <div className="mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
      <div className="flex w-full flex-grow flex-col items-center justify-center">
        <div className="flex size-full flex-col justify-center px-8">
          <div className="text-2xl font-semibold">I'm Liz</div>
          <div className="text-2xl text-muted-foreground/65">
            How can I help you today?
          </div>
        </div>
      </div>
      <div className="grid w-full gap-2 pb-4 md:grid-cols-2">
        <ThreadPrimitive.Suggestion
          prompt="List my SAP systems"
          asChild
        >
          <Button
            type="primary-white"
            className="flex-col items-start justify-start gap-1"
          >
            <span className="font-medium">List my SAP systems</span>
          </Button>
        </ThreadPrimitive.Suggestion>
        <ThreadPrimitive.Suggestion
          prompt="Are all my systems healthy?"
          asChild
        >
          <Button
            type="primary-white"
            className="flex-col items-start justify-start gap-1"
          >
            <span className="font-medium">Are all my systems healthy?</span>
          </Button>
        </ThreadPrimitive.Suggestion>
      </div>
    </div>
  );
}

function Composer() {
  return (
    <ComposerPrimitive.Root className="relative flex w-full flex-col">
      <ComposerPrimitive.AttachmentDropzone className="relative flex w-full flex-col rounded-3xl border-2 border-jungle-green-500 bg-background outline-none transition-all has-[textarea:focus-visible]:border-jungle-green-600 has-[textarea:focus-visible]:ring-2 has-[textarea:focus-visible]:ring-jungle-green-500/30 data-[dragging=true]:border-jungle-green-600 data-[dragging=true]:border-dashed data-[dragging=true]:bg-jungle-green-50 dark:data-[dragging=true]:bg-jungle-green-900/20">
        <ComposerPrimitive.Input
          placeholder="Send a message..."
          className="max-h-32 min-h-12 w-full resize-none bg-transparent px-4 py-3 pr-14 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <ComposerAction />
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
}

function ComposerAction() {
  return (
    <div className="absolute right-2 bottom-2">
      <AuiIf condition={({ thread }) => !thread.isRunning}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send message"
            side="bottom"
            type="submit"
            variant="default"
            size="icon"
            className="size-8 rounded-full"
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'var(--accent-foreground)',
            }}
            aria-label="Send message"
          >
            <ArrowUpIcon className="size-4" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </AuiIf>

      <AuiIf condition={({ thread }) => thread.isRunning}>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip="Stop generating"
            side="bottom"
            variant="default"
            size="icon"
            className="size-8 rounded-full"
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'var(--accent-foreground)',
            }}
            aria-label="Stop generating"
          >
            <SquareIcon className="size-4 fill-current" />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </div>
  );
}

function ThreadScrollToBottom() {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="ghost"
        className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 rounded-full p-4 disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root
      className="mx-auto grid w-full max-w-[var(--thread-max-width)] auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 py-4 fade-in slide-in-from-bottom-1 animate-in duration-150"
      data-role="user"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-jungle-green-500/10">
        <UserIcon className="size-4 text-jungle-green-600 dark:text-jungle-green-400" />
      </div>
      <div className="relative col-start-2 min-w-0">
        <div className="rounded-3xl bg-green-100 px-4 py-2.5 break-words text-foreground">
          <MessagePrimitive.Parts />
        </div>
        <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
          <UserActionBar />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}

function UserActionBar() {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex flex-col items-end"
    >
    </ActionBarPrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root
      className="relative mx-auto w-full max-w-[var(--thread-max-width)] py-4 fade-in slide-in-from-bottom-1 animate-in duration-150"
      data-role="assistant"
    >
      <div className="flex gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-jungle-green-500/10 flex-shrink-0">
          <BotIcon className="size-4 text-jungle-green-600 dark:text-jungle-green-400" />
        </div>
        <div className="flex-1 rounded-2xl bg-green-100 px-4 py-3">
          <div className="break-words leading-relaxed text-foreground">
            <MessagePrimitive.Parts
              components={{
                Text: CustomMarkdownText,
                // tools: { Fallback: ToolFallback },
              }}
            />

            <MessageError />
            <AuiIf
              condition={({ thread, message }) =>
                thread.isRunning && message.content.length === 0
              }
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <LoaderIcon className="size-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </AuiIf>
          </div>
        </div>
      </div>

      <div className="mt-1 ml-2 flex">
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
}

function ThreadSuggestions() {
  return (
    <AuiIf condition={({ thread }) => !thread.isRunning && !thread.isEmpty}>
      <div className="mx-auto mt-4 flex w-full max-w-[var(--thread-max-width)] flex-wrap gap-2 px-2 mb-2">
        <ThreadPrimitive.Suggestion prompt="Tell me more" asChild>
          <button className="rounded-full bg-green-100 px-3 py-1 text-sm hover:bg-green-200 cursor-pointer transition-colors">
            Tell me more
          </button>
        </ThreadPrimitive.Suggestion>
        <ThreadPrimitive.Suggestion prompt="Can you explain differently?" asChild>
          <button className="rounded-full bg-green-100 px-3 py-1 text-sm hover:bg-green-200 cursor-pointer transition-colors">
            Explain differently
          </button>
        </ThreadPrimitive.Suggestion>
      </div>
    </AuiIf>
  );
}

function MessageError() {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="mt-2 rounded-full border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
}

function AssistantActionBar() {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="-ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-full data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <AuiIf condition={({ message }) => message.isCopied}>
            <CheckIcon />
          </AuiIf>
          <AuiIf condition={({ message }) => !message.isCopied}>
            <CopyIcon />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.ExportMarkdown asChild>
        <TooltipIconButton tooltip="Export as Markdown">
          <DownloadIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.ExportMarkdown>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
}
