// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { MessageBubbleView } from './MessageBubble';

export default {
  title: 'Components/AIAssistant/MessageBubble',
  component: MessageBubbleView,
  argTypes: {
    variant: {
      description: 'Whether the bubble belongs to the user or the assistant',
      options: ['user', 'assistant'],
      control: { type: 'radio' },
    },
    children: {
      description: 'Content rendered inside the bubble',
      control: false,
    },
  },
};

export const User = {
  args: {
    variant: 'user',
    children: 'What is the API key for adding agents?',
  },
};

export const Assistant = {
  args: {
    variant: 'assistant',
    children: 'Use the API key shown in the Settings → Agents page.',
  },
};

export const AssistantWithRichContent = {
  args: {
    variant: 'assistant',
    children: (
      <div>
        <p className="mb-2">Here are the steps:</p>
        <ol className="list-decimal pl-5">
          <li>Open the agents page.</li>
          <li>Click the copy button next to the key.</li>
          <li>
            Run{' '}
            <code className="bg-gray-100 px-1 rounded">
              trento-agent install
            </code>
            .
          </li>
        </ol>
      </div>
    ),
  },
};
