import React from 'react';
import { AuiIf, ThreadPrimitive } from '@assistant-ui/react';

import { ChatHeader } from './ChatHeader';
import { PromptComposer } from './PromptComposer';
import { AssistantMessage, UserMessage } from './MessageBubble';
import { ThreadWelcome } from './ThreadWelcome';

const SUGGESTION_CLASS_NAME =
  'text-left bg-[#f8f9fa] border border-gray-200 rounded-lg p-3.5 text-gray-500 hover:bg-gray-100 transition-colors text-[15px]';

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
        className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto scroll-smooth px-6 pt-4"
      >
        <AuiIf condition={({ thread }) => thread.isEmpty}>
          <WelcomePanel />
        </AuiIf>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mx-auto mt-auto flex w-full max-w-[var(--thread-max-width)] flex-col bg-white pt-4 pb-4">
          <PromptComposer />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}

function WelcomePanel() {
  return (
    <ThreadWelcome>
      <ThreadPrimitive.Suggestion
        prompt="What is the API key for adding agents?"
        className={SUGGESTION_CLASS_NAME}
      >
        <span className="font-bold text-gray-600">What is the API key</span> for
        adding agents?
      </ThreadPrimitive.Suggestion>
      <ThreadPrimitive.Suggestion
        prompt="What is the check results that was run recently?"
        className={SUGGESTION_CLASS_NAME}
      >
        <span className="font-bold text-gray-600">
          What is the check results
        </span>{' '}
        that was run recently?
      </ThreadPrimitive.Suggestion>
    </ThreadWelcome>
  );
}
