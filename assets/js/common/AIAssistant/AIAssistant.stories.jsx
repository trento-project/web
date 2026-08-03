// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router';

import { SocketContext } from '@common/SocketProvider';
import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';
import { buildAssistantTurn } from '@lib/test-utils/aguiEvents';

import AIAssistant from './AIAssistant';

const USER_ID = 1;
const TOPIC = `ai_assistant:${USER_ID}`;

function StoryProviders({ socket, children }) {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

function useFreshSocket() {
  const [socket] = useState(makeMockSocket());
  return socket;
}

// Drives the channel into the connection state requested by the story.
//
//  - 'fireOk'             — fire join 'ok' once the channel exists, then idle.
//  - 'dropAfterConnect'   — connect, then drop the transport after a short delay.
//  - 'none'               — leave the channel pending (status stays 'connecting').
function useChannelScript(socket, script) {
  useEffect(() => {
    const channel = socket.channels.get(TOPIC);
    if (!channel) return undefined;

    if (script === 'fireOk' || script === 'dropAfterConnect') {
      channel.joinPush.fire('ok');
    }
    if (script === 'dropAfterConnect') {
      const t = setTimeout(
        () => channel.errorHandlers.forEach((cb) => cb()),
        50
      );
      return () => clearTimeout(t);
    }
    return undefined;
  }, [socket, script]);
}

// Since ai configuration events are pushed by the server, we need a way to simulate them in stories.
function useConfigurationEvents(socket, events) {
  useEffect(() => {
    if (!events?.length) return undefined;

    const channel = socket.channels.get(TOPIC);
    if (!channel) return undefined;

    const timers = events.map(({ event, payload }, i) =>
      setTimeout(() => channel.emit(event, payload), 50 + i * 50)
    );
    return () => timers.forEach(clearTimeout);
    // The event list is captured at mount, as with useSimulatedTurn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);
}

// Types the user's prompt into the composer, hits send, then plays an
// assistant turn back through the channel. Assumes useChannelScript has
// already brought the channel up. `turn.stepDelayMs > 0` reveals deltas
// progressively for the streaming demo; 0 fires synchronously for a frozen
// conversation.
function useSimulatedTurn(socket, turn) {
  useEffect(() => {
    if (!turn) return undefined;

    let cancelled = false;
    const timers = [];

    const channel = socket.channels.get(TOPIC);
    if (!channel) return undefined;

    const setNativeValue = (el, value) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      ).set;
      setter.call(el, value);
      el.dispatchEvent(new window.Event('input', { bubbles: true }));
    };

    const run = async () => {
      // Wait one paint so composer + send have mounted.
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      if (cancelled) return;

      const composer = document.querySelector('[aria-label="Message input"]');
      const send = document.querySelector('[aria-label="Send message"]');
      if (!composer || !send) return;

      setNativeValue(composer, turn.userText);
      send.click();

      // Wait for WebSocketAIAgent to push send_message back to the channel.
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (cancelled) return;

      const sent = channel.pushed
        .filter((p) => p.event === 'send_message')
        .at(-1);
      if (!sent) return;

      const { thread_id: threadId, run_id: runId } = sent.payload;
      const events = buildAssistantTurn({
        threadId,
        runId,
        messageId: 'asst-1',
        deltas: turn.assistantDeltas,
      });

      const fire = (e) => channel.emit('ag_ui_event', e);

      if (turn.stepDelayMs > 0) {
        events.forEach((event, i) => {
          timers.push(
            setTimeout(() => {
              if (!cancelled) fire(event);
            }, i * turn.stepDelayMs)
          );
        });
      } else {
        events.forEach(fire);
      }
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // The turn config is captured at mount; restarting on field changes is
    // never what we want here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);
}

export default {
  title: 'Components/AIAssistant/AIAssistant',
  component: AIAssistant,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, iframeHeight: 720 },
    },
    aiAssistant: {
      script: 'fireOk',
      turn: null,
      events: null,
    },
  },
  args: { userID: USER_ID },
  argTypes: {
    userID: {
      description: 'User ID for the AI assistant session',
      control: { type: 'text' },
    },
    open: {
      description: 'Whether the assistant is open',
      control: { type: 'boolean' },
    },
    initialConnectionStatus: {
      description: 'Initial connection status',
      options: ['connected', 'connecting', 'disconnected'],
      control: { type: 'radio' },
    },
  },
  decorators: [
    (Story, context) => {
      const socket = useFreshSocket();
      const { script, turn, events } = context.parameters.aiAssistant ?? {};
      useChannelScript(socket, script);
      useSimulatedTurn(socket, turn);
      useConfigurationEvents(socket, events);
      // Router needed by the Profile links in the disabled launcher tooltip
      // and the cleared-configuration banner.
      return (
        <MemoryRouter>
          <StoryProviders socket={socket}>
            <Story />
          </StoryProviders>
        </MemoryRouter>
      );
    },
  ],
};

export const Closed = {
  name: 'Closed (FAB only)',
  args: { open: false },
};

export const Disabled = {
  name: 'Disabled — no AI configuration',
  args: { open: false, aiConfigured: false },
};

export const OpenEmpty = {
  name: 'Open — empty thread',
  args: { open: true },
};

export const OpenConversation = {
  name: 'Open — with conversation',
  args: { open: true },
  parameters: {
    aiAssistant: {
      turn: {
        userText: 'What is the API key for adding agents?',
        assistantDeltas: [
          'You can find the API key on the **Settings → Agents** page. ',
          'Copy it and paste it into the agent installer.',
        ],
        stepDelayMs: 0,
      },
    },
  },
};

export const OpenDisconnected = {
  name: 'Open — disconnected',
  args: { open: true },
  parameters: {
    aiAssistant: { script: 'dropAfterConnect' },
  },
};

export const OpenConfigurationCleared = {
  name: 'Open — AI settings cleared (read-only)',
  args: { open: true },
  parameters: {
    aiAssistant: { events: [{ event: 'ai_configuration_cleared' }] },
  },
};

export const OpenConfigurationRestored = {
  name: 'Open — new configuration, awaiting a new chat',
  args: { open: true },
  parameters: {
    aiAssistant: {
      events: [
        { event: 'ai_configuration_cleared' },
        { event: 'ai_configuration_created' },
      ],
    },
  },
};

export const OpenModelChanged = {
  name: 'Open — model changed notice',
  args: { open: true },
  parameters: {
    aiAssistant: {
      events: [
        {
          event: 'model_changed',
          payload: { provider: 'googleai', model: 'gemini-2.5-pro' },
        },
      ],
    },
  },
};

export const OpenStreaming = {
  name: 'Open — streaming response (interactive)',
  args: { open: true },
  parameters: {
    aiAssistant: {
      turn: {
        userText: 'Walk me through the trento deployment.',
        assistantDeltas: [
          'The deployment ',
          'consists of two ',
          'main parts: ',
          '**web** ',
          '(this UI + control plane) ',
          'and **wanda** ',
          '(the checks engine).\n\n',
          'Both run as Elixir releases, ',
          'usually behind a reverse proxy.',
        ],
        stepDelayMs: 250,
      },
    },
  },
};
