// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from '@assistant-ui/react';

import { identity } from 'lodash';

import { ThreadContainer, ThreadMessages } from '../AssistantThread';

// A thread seeded via a custom external-store runtime with static messages.
function SeededThread({ messages }) {
  const runtime = useExternalStoreRuntime({
    messages,
    isRunning: false,
    isLoading: false,
    convertMessage: identity,
    onNew: () => Promise.resolve(),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadContainer>
        <ThreadMessages />
      </ThreadContainer>
    </AssistantRuntimeProvider>
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
