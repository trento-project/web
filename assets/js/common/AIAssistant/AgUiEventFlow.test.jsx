// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router';
import { config as rxjsConfig } from 'rxjs';
import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';
import { buildAssistantTurn } from '@lib/test-utils/aguiEvents';

import { useSocket } from '@common/SocketProvider';
import AIAssistant from './AIAssistant';

// RxJS reports unhandled subscriber errors via setTimeout(() => throw err) by
// default — terminal AG-UI events (ie RUN_ERROR) hit
// this path and would crash the test runner. Capture them instead so tests
// can assert on observable outcomes.
let unhandledRxErrors = [];
beforeEach(() => {
  unhandledRxErrors = [];
  rxjsConfig.onUnhandledError = (err) => unhandledRxErrors.push(err);
});
afterEach(() => {
  rxjsConfig.onUnhandledError = null;
});

jest.mock('@common/SocketProvider', () => ({
  useSocket: jest.fn(),
}));

// Markdown rendering is its own concern — replace with a plain span so the
// scenarios can assert text directly without dragging react-markdown into
// the test path.
jest.mock('@assistant-ui/react-markdown', () => ({
  MarkdownTextPrimitive: ({ text }) => <span data-aui-md>{text}</span>,
}));

async function renderAssistant({ userId = 'user-1' } = {}) {
  const socket = makeMockSocket();
  useSocket.mockReturnValue(socket);

  const utils = render(
    <BrowserRouter>
      <AIAssistant userID={userId} open />
    </BrowserRouter>
  );

  const channel = await waitFor(() => {
    const c = socket.channels.get(`ai_assistant:${userId}`);
    if (!c) throw new Error('channel not opened yet');
    return c;
  });

  // Complete the channel join handshake — agent transitions to 'connected'.
  await act(async () => {
    channel.joinPush.fire('ok');
  });

  await screen.findByLabelText('Message input');
  const user = userEvent.setup();

  // Synchronously fire an AG-UI event on the channel. Terminal events
  // (ie RUN_ERROR) call subscriber.error which RxJS
  // reports as an unhandled error after a microtask tick — act() surfaces
  // that as a throw, so we swallow it; tests assert on observable outcomes.
  const emitAgUi = async (event) => {
    try {
      await act(async () => {
        try {
          channel.emit('ag_ui_event', event);
        } catch {
          // assistant-ui's subscription error handlers re-throw synchronously
          // for terminal events (RUN_ERROR); swallow here so the test can
          // assert on observable outcomes rather than the throw.
        }
      });
    } catch {
      // ditto, in case act() surfaces it on the outer await
    }
  };

  // Drives a user turn through the real composer and waits for the agent to
  // push a NEW send_message back to the channel. Re-queries DOM each time
  // because assistant-ui swaps composer/send subtrees as thread state changes.
  const sendUserMessage = async (text) => {
    const sentBefore = channel.pushed.filter(
      (p) => p.event === 'send_message'
    ).length;
    const composer = await screen.findByLabelText('Message input');
    const send = await screen.findByLabelText('Send message');
    await user.click(composer);
    await user.keyboard(text);
    await user.click(send);
    await waitFor(() => {
      const sent = channel.pushed.filter((p) => p.event === 'send_message');
      if (sent.length <= sentBefore) {
        throw new Error('send_message not pushed yet');
      }
    });
    const sent = channel.pushed.filter((p) => p.event === 'send_message');
    return sent[sent.length - 1].payload;
  };

  // Streams a complete assistant turn (RUN_STARTED → text → RUN_FINISHED)
  // through the channel one event at a time so each is wrapped in act().
  const streamAssistantTurn = async (params) => {
    for (const event of buildAssistantTurn(params)) {
      await emitAgUi(event);
    }
    return params.messageId;
  };

  return {
    ...utils,
    channel,
    socket,
    emitAgUi,
    sendUserMessage,
    streamAssistantTurn,
  };
}

const assistantBubble = () => {
  const nodes = document.querySelectorAll('[data-role="assistant"]');
  return nodes[nodes.length - 1] || null;
};

describe('AG-UI event flow', () => {
  it('streams an assistant response delta-by-delta into a message bubble', async () => {
    const { emitAgUi, sendUserMessage } = await renderAssistant();
    const { thread_id: threadId, run_id: runId } =
      await sendUserMessage('hello');

    const messageId = 'asst-1';
    await emitAgUi({ type: 'RUN_STARTED', threadId, runId });
    await emitAgUi({
      type: 'TEXT_MESSAGE_START',
      messageId,
      role: 'assistant',
    });
    await emitAgUi({ type: 'TEXT_MESSAGE_CONTENT', messageId, delta: 'Hi ' });

    await waitFor(() => {
      expect(assistantBubble()).toHaveTextContent(/Hi/);
    });

    await emitAgUi({
      type: 'TEXT_MESSAGE_CONTENT',
      messageId,
      delta: 'there',
    });
    await emitAgUi({ type: 'TEXT_MESSAGE_END', messageId });
    await emitAgUi({ type: 'RUN_FINISHED', threadId, runId });

    await waitFor(() => {
      expect(assistantBubble()).toHaveTextContent('Hi there');
    });
  });

  it('disables the composer input when the channel drops', async () => {
    const { channel } = await renderAssistant();

    expect(screen.getByLabelText('Message input')).not.toBeDisabled();

    await act(async () => {
      channel.errorHandlers.forEach((cb) => cb());
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Message input')).toBeDisabled();
    });
  });

  it('goes read-only with a banner when the AI configuration is cleared', async () => {
    const { channel } = await renderAssistant();

    expect(screen.getByLabelText('Message input')).not.toBeDisabled();

    await act(async () => {
      channel.emit('ai_configuration_cleared');
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Message input')).toBeDisabled();
    });

    expect(screen.getByText(/settings were cleared/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'href',
      '/profile'
    );
  });

  it('handles a follow-up turn after the previous one finishes', async () => {
    const { sendUserMessage, streamAssistantTurn } = await renderAssistant();

    {
      const { thread_id: threadId, run_id: runId } =
        await sendUserMessage('first');
      await streamAssistantTurn({
        threadId,
        runId,
        messageId: 'a',
        deltas: ['one'],
      });
    }
    {
      const { thread_id: threadId, run_id: runId } =
        await sendUserMessage('second');
      await streamAssistantTurn({
        threadId,
        runId,
        messageId: 'b',
        deltas: ['two'],
      });
    }

    await waitFor(() => {
      expect(screen.getByText('first')).toBeInTheDocument();
      expect(screen.getByText('one')).toBeInTheDocument();
      expect(screen.getByText('second')).toBeInTheDocument();
      expect(screen.getByText('two')).toBeInTheDocument();
    });
  });
});
