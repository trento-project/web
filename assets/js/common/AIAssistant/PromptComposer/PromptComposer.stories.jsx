// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';

import { SocketContext } from '@common/SocketProvider';
import { CONNECTION_STATUS } from '@lib/ai';
import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';

import AssistantChatProvider from '../AssistantChatProvider';
import { CONFIGURATION_STATUS } from '../status';
import PromptComposer from './PromptComposer';

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
      options: Object.values(CONNECTION_STATUS),
      control: { type: 'radio' },
    },
    configurationStatus: {
      description:
        'AI configuration state. Anything other than "ok" makes the thread ' +
        'read-only and takes over the placeholder, whatever the connection is',
      options: Object.values(CONFIGURATION_STATUS),
      control: { type: 'radio' },
    },
    isRunning: {
      description: 'Whether a run is in flight (hides the send button)',
      control: { type: 'boolean' },
    },
  },
  args: { configurationStatus: CONFIGURATION_STATUS.OK },
  decorators: [
    (Story) => (
      <StoryProviders>
        <Story />
      </StoryProviders>
    ),
  ],
};

export const Idle = {
  args: { connectionStatus: CONNECTION_STATUS.CONNECTED, isRunning: false },
};

export const Disabled = {
  args: { connectionStatus: CONNECTION_STATUS.DISCONNECTED, isRunning: false },
};

export const Sending = {
  args: { connectionStatus: CONNECTION_STATUS.CONNECTED, isRunning: true },
};

export const ConfigurationCleared = {
  name: 'Read-only — AI settings cleared',
  args: {
    connectionStatus: CONNECTION_STATUS.CONNECTED,
    configurationStatus: CONFIGURATION_STATUS.CLEARED,
    isRunning: false,
  },
};

export const ConfigurationRestored = {
  name: 'Read-only — awaiting a new chat',
  args: {
    connectionStatus: CONNECTION_STATUS.CONNECTED,
    configurationStatus: CONFIGURATION_STATUS.RESTORED,
    isRunning: false,
  },
};
