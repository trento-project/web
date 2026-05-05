// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';

import { SocketContext } from '@common/SocketProvider';
import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';

import AssistantChatProvider from '../AssistantChatProvider';
import { PromptComposer } from './PromptComposer';

// PromptComposer relies on @assistant-ui/react's ComposerPrimitive.*, which
// in turn need an AssistantRuntimeProvider in scope. Mount the real
// AssistantChatProvider over a no-op mock socket so the primitives mount
// cleanly without talking to a backend. The connection-state visuals are
// driven by the `connectionStatus` prop, not the runtime, so the join
// handshake never has to fire.
function StoryProviders({ children }) {
  const [socket] = useState(makeMockSocket());
  return (
    <SocketContext.Provider value={socket}>
      <AssistantChatProvider userID="storybook" threadID="storybook">
        {children}
      </AssistantChatProvider>
    </SocketContext.Provider>
  );
}

export default {
  title: 'Components/AIAssistant/PromptComposer',
  component: PromptComposer,
  parameters: { layout: 'padded' },
  argTypes: {
    connectionStatus: {
      description:
        'Connection state used to drive the placeholder + disabled state',
      options: ['connected', 'connecting', 'disconnected'],
      control: { type: 'radio' },
    },
    isRunning: {
      description: 'Whether a run is in flight (hides the send button)',
      control: { type: 'boolean' },
    },
  },
  decorators: [
    (Story) => (
      <StoryProviders>
        <Story />
      </StoryProviders>
    ),
  ],
};

export const Idle = {
  args: { connectionStatus: 'connected', isRunning: false },
};

export const Disabled = {
  args: { connectionStatus: 'disconnected', isRunning: false },
};

export const Sending = {
  args: { connectionStatus: 'connected', isRunning: true },
};
