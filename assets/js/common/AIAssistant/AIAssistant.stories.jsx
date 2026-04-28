import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { SocketContext } from '@common/SocketProvider';
import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';
import { buildAssistantTurn } from '@lib/test-utils/aguiEvents';

import AIAssistant from './AIAssistant';
import { AssistantChatProvider } from './AssistantChatProvider';
import { AssistantThread } from './AssistantThread';
import { ModalFrame } from './ModalFrame';

// ---------- Story scaffolding -----------------------------------------------

const USER_ID = 1;
const TOPIC = `ai_assistant:${USER_ID}`;

const store = configureStore([])({ user: { id: USER_ID } });

function StoryProviders({ socket, children }) {
  return (
    <Provider store={store}>
      <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    </Provider>
  );
}

function OpenAssistant({ children }) {
  return (
    <AssistantChatProvider>
      <ModalFrame open onOpenChange={() => {}}>
        <AssistantThread onClose={() => {}} />
      </ModalFrame>
      {children}
    </AssistantChatProvider>
  );
}

// Drives the composer via DOM and emits a simulated assistant turn back
// through the channel. `stepDelayMs > 0` reveals deltas progressively for
// the streaming demo; 0 fires synchronously for a frozen conversation.
function useSimulatedTurn(socket, { userText, assistantDeltas, stepDelayMs }) {
  useEffect(() => {
    let cancelled = false;
    const timers = [];

    const channel = socket.channels.get(TOPIC);
    if (!channel) return undefined;

    channel.joinPush.fire('ok');

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

      setNativeValue(composer, userText);
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
        deltas: assistantDeltas,
      });

      const fire = (e) => channel.emit('ag_ui_event', e);

      if (stepDelayMs > 0) {
        events.forEach((event, i) => {
          timers.push(
            setTimeout(() => {
              if (!cancelled) fire(event);
            }, i * stepDelayMs)
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
    // userText / assistantDeltas / stepDelayMs are set per-story and never
    // change for the lifetime of a story render — re-running on changes would
    // restart the simulated turn, which is not what we want.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);
}

function useFreshSocket() {
  const [socket] = useState(makeMockSocket);
  return socket;
}

function useFireJoinOk(socket) {
  useEffect(() => {
    const channel = socket.channels.get(TOPIC);
    if (channel) channel.joinPush.fire('ok');
  }, [socket]);
}

function useDropAfterConnect(socket) {
  useEffect(() => {
    const channel = socket.channels.get(TOPIC);
    if (!channel) return undefined;
    channel.joinPush.fire('ok');
    const t = setTimeout(() => channel.errorHandlers.forEach((cb) => cb()), 50);
    return () => clearTimeout(t);
  }, [socket]);
}

// ---------- Stories ---------------------------------------------------------

export default {
  title: 'Components/AIAssistant/AIAssistant',
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, iframeHeight: 720 },
    },
  },
};

export const Closed = {
  name: 'Closed (FAB only)',
  render: () => {
    const socket = useFreshSocket();
    useFireJoinOk(socket);
    return (
      <StoryProviders socket={socket}>
        <AIAssistant />
      </StoryProviders>
    );
  },
};

export const OpenEmpty = {
  name: 'Open — empty thread',
  render: () => {
    const socket = useFreshSocket();
    useFireJoinOk(socket);
    return (
      <StoryProviders socket={socket}>
        <OpenAssistant />
      </StoryProviders>
    );
  },
};

export const OpenConversation = {
  name: 'Open — with conversation',
  render: () => {
    const socket = useFreshSocket();
    useSimulatedTurn(socket, {
      userText: 'What is the API key for adding agents?',
      assistantDeltas: [
        'You can find the API key on the **Settings → Agents** page. ',
        'Copy it and paste it into the agent installer.',
      ],
      stepDelayMs: 0,
    });
    return (
      <StoryProviders socket={socket}>
        <OpenAssistant />
      </StoryProviders>
    );
  },
};

export const OpenDisconnected = {
  name: 'Open — disconnected',
  render: () => {
    const socket = useFreshSocket();
    useDropAfterConnect(socket);
    return (
      <StoryProviders socket={socket}>
        <OpenAssistant />
      </StoryProviders>
    );
  },
};

export const OpenStreaming = {
  name: 'Open — streaming response (interactive)',
  render: () => {
    const socket = useFreshSocket();
    useSimulatedTurn(socket, {
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
    });
    return (
      <StoryProviders socket={socket}>
        <OpenAssistant />
      </StoryProviders>
    );
  },
};
