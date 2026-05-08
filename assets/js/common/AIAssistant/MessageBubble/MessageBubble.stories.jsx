// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  useAui,
  useExternalStoreRuntime,
} from '@assistant-ui/react';

import { AssistantMessage, UserMessage } from './MessageBubble';
import { identity } from 'lodash';

// UserMessage / AssistantMessage rely on MessagePrimitive scoping established
// by <ThreadPrimitive.Messages>. Mount a minimal external-store runtime
// seeded with the messages we want to render — no backend, no agent, just
// static state. onNew is required by the adapter contract but never fires
// here since the stories don't render a composer.
function StubRuntime({ messages, children }) {
  const runtime = useExternalStoreRuntime({
    messages,
    isRunning: false,
    isLoading: false,
    convertMessage: identity,
    onNew: () => Promise.resolve(),
  });
  const aui = useAui();
  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      <ThreadPrimitive.Root>{children}</ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}

function SeededThread({ messages }) {
  return (
    <StubRuntime messages={messages}>
      <ThreadPrimitive.Messages
        components={{ UserMessage, AssistantMessage }}
      />
    </StubRuntime>
  );
}

const RICH_ASSISTANT_MARKDOWN = [
  'Here are the steps:',
  '',
  '1. Open the agents page.',
  '2. Click the copy button next to the key.',
  '3. Run `trento-agent install`.',
].join('\n');

export default {
  title: 'Components/AIAssistant/MessageBubble',
  parameters: { layout: 'padded' },
};

export const User = {
  render: () => (
    <SeededThread
      messages={[
        { role: 'user', content: 'What is the API key for adding agents?' },
      ]}
    />
  ),
};

export const Assistant = {
  render: () => (
    <SeededThread
      messages={[
        {
          role: 'assistant',
          content: 'Use the API key shown in the Settings → Agents page.',
        },
      ]}
    />
  ),
};

export const AssistantWithRichContent = {
  render: () => (
    <SeededThread
      messages={[{ role: 'assistant', content: RICH_ASSISTANT_MARKDOWN }]}
    />
  ),
};

export const Conversation = {
  render: () => (
    <SeededThread
      messages={[
        { role: 'user', content: 'What is the API key for adding agents?' },
        {
          role: 'assistant',
          content: 'Use the API key shown in the Settings → Agents page.',
        },
      ]}
    />
  ),
};
