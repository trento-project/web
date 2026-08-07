// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderAIAssistant } from '@lib/test-utils/aiAssistant';
import { aguiEvents } from '@lib/test-utils/aguiEvents';

const assistantBubbles = () =>
  Array.from(document.querySelectorAll('[data-role="assistant"]'));

const assistantBubble = () => {
  const nodes = assistantBubbles();
  return nodes[nodes.length - 1] || null;
};

// A run stopped once it had begun to answer. Streaming a token first is the
// load-bearing part of the setup: an answer with text in it survives the stop
// and keeps its marker, while a run stopped before its first token leaves no
// bubble at all — see 'hands the prompt back...' below.
const streamThenStop = async (
  { user, emitAgUi, sendUserMessage },
  delta = 'half an answer'
) => {
  const { thread_id: threadId, run_id: runId } = await sendUserMessage('hello');
  const messageId = 'asst-1';

  await emitAgUi(aguiEvents.runStarted({ threadId, runId }));
  await emitAgUi(aguiEvents.textStart({ messageId }));
  await emitAgUi(aguiEvents.textContent({ messageId, delta }));
  await waitFor(() => {
    expect(assistantBubble()).toHaveTextContent(delta);
  });

  await user.click(screen.getByRole('button', { name: 'Stop generating' }));
  await screen.findByLabelText('Send message');

  return { threadId, runId };
};

describe('AG-UI event flow', () => {
  it('clears the empty-thread greeting once the runtime reports a message', async () => {
    const { sendUserMessage } = await renderAIAssistant({ open: true });

    expect(screen.getByText("Hi, I'm Liz.")).toBeVisible();

    await sendUserMessage('hello');

    await waitFor(() => {
      expect(screen.queryByText("Hi, I'm Liz.")).not.toBeInTheDocument();
    });
  });

  it('streams an assistant response delta-by-delta into a message bubble', async () => {
    const { emitAgUi, sendUserMessage } = await renderAIAssistant({
      open: true,
    });
    const { thread_id: threadId, run_id: runId } =
      await sendUserMessage('hello');

    const messageId = 'asst-1';
    await emitAgUi(aguiEvents.runStarted({ threadId, runId }));
    await emitAgUi(aguiEvents.textStart({ messageId }));
    await emitAgUi(aguiEvents.textContent({ messageId, delta: 'Hi ' }));

    await waitFor(() => {
      expect(assistantBubble()).toHaveTextContent(/Hi/);
    });

    await emitAgUi(aguiEvents.textContent({ messageId, delta: 'there' }));
    await emitAgUi(aguiEvents.textEnd({ messageId }));
    await emitAgUi(aguiEvents.runFinished({ threadId, runId }));

    await waitFor(() => {
      expect(assistantBubble()).toHaveTextContent('Hi there');
    });
  });

  it('shows the progress indicator while a run is in flight', async () => {
    const { emitAgUi, sendUserMessage } = await renderAIAssistant({
      open: true,
    });
    const { thread_id: threadId, run_id: runId } =
      await sendUserMessage('hello');

    await emitAgUi(aguiEvents.runStarted({ threadId, runId }));

    expect(await screen.findByText('Thinking...')).toBeVisible();

    const messageId = 'assistant-progress';
    await emitAgUi(aguiEvents.textStart({ messageId }));
    await emitAgUi(aguiEvents.textContent({ messageId, delta: 'Working' }));

    await waitFor(() => {
      expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
    });
  });

  it('settles the thread silently when unmounted mid-run', async () => {
    const { channel, emitAgUi, sendUserMessage, unmount } =
      await renderAIAssistant({ open: true });
    const leave = jest.spyOn(channel, 'leave');
    const { thread_id: threadId, run_id: runId } =
      await sendUserMessage('hello');

    await emitAgUi(aguiEvents.runStarted({ threadId, runId }));

    unmount();

    expect(leave).toHaveBeenCalled();
  });

  it('disables the composer input and "New chat" when the channel drops', async () => {
    const { channel } = await renderAIAssistant({ open: true });

    expect(screen.getByLabelText('Message input')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'New chat' })).toBeEnabled();

    await act(async () => {
      channel.triggerError();
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Message input')).toBeDisabled();
    });
    expect(screen.getByRole('button', { name: 'New chat' })).toBeDisabled();
  });

  it('goes read-only when the AI configuration is cleared', async () => {
    const { channel } = await renderAIAssistant({ open: true });

    expect(screen.getByLabelText('Message input')).toBeEnabled();

    await act(async () => {
      channel.emit('ai_configuration_cleared');
    });

    // The placeholder, not just the disabled flag, is what distinguishes a
    // cleared configuration from a dropped channel
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('AI Assistant is disabled')
      ).toBeDisabled();
    });
  });

  const emitModelChange = (channel) =>
    act(async () => {
      channel.emit('model_changed', {
        provider: 'googleai',
        model: 'gemini-2.5-pro',
      });
    });

  it('renders the model_changed notice as a dismissable banner', async () => {
    const user = userEvent.setup();
    const { channel } = await renderAIAssistant({ open: true });

    await emitModelChange(channel);

    expect(await screen.findByText(/AI model changed to/i)).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    await waitFor(() => {
      expect(
        screen.queryByText(/AI model changed to/i)
      ).not.toBeInTheDocument();
    });
  });

  it('"New chat" clears the model-change notice', async () => {
    const { channel, user } = await renderAIAssistant({ open: true });

    await emitModelChange(channel);
    expect(await screen.findByText(/AI model changed to/i)).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'New chat' }));

    await waitFor(() => {
      expect(
        screen.queryByText(/AI model changed to/i)
      ).not.toBeInTheDocument();
    });
  });

  it('prompts to start a new chat when a new config arrives after a clear', async () => {
    const { channel, user } = await renderAIAssistant({ open: true });

    await act(async () => {
      channel.emit('ai_configuration_cleared');
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Message input')).toBeDisabled();
    });

    await act(async () => {
      channel.emit('ai_configuration_created');
    });

    await waitFor(() => {
      expect(
        screen.getByText(/new AI configuration is available/i)
      ).toBeInTheDocument();
    });
    // Still read-only until the user explicitly restarts
    expect(
      screen.getByPlaceholderText('Start a new chat to continue')
    ).toBeDisabled();

    const newChat = screen.getByRole('button', { name: 'New chat' });
    expect(newChat).toBeEnabled();

    await user.click(newChat);

    await waitFor(() => {
      expect(screen.getByLabelText('Message input')).toBeEnabled();
    });
    expect(
      screen.queryByText(/new AI configuration is available/i)
    ).not.toBeInTheDocument();
  });

  it('locks "New chat" for the length of the run', async () => {
    const { emitAgUi, sendUserMessage } = await renderAIAssistant({
      open: true,
    });
    const newChat = () => screen.getByRole('button', { name: 'New chat' });

    expect(newChat()).toBeEnabled();

    const { thread_id: threadId, run_id: runId } =
      await sendUserMessage('hello');

    expect(newChat()).toBeDisabled();

    const messageId = 'asst-1';
    await emitAgUi(aguiEvents.runStarted({ threadId, runId }));
    await emitAgUi(aguiEvents.textStart({ messageId }));
    await emitAgUi(aguiEvents.textContent({ messageId, delta: 'half' }));

    expect(newChat()).toBeDisabled();

    await emitAgUi(aguiEvents.textEnd({ messageId }));
    await emitAgUi(aguiEvents.runFinished({ threadId, runId }));

    await waitFor(() => expect(newChat()).toBeEnabled());
  });

  it('stops a streaming run without discarding what is on screen', async () => {
    const context = await renderAIAssistant({ open: true });
    const { threadId, runId } = await streamThenStop(context);

    expect(
      context.channel.pushed.filter((p) => p.event === 'cancel_run')
    ).toEqual([
      expect.objectContaining({
        payload: { run_id: runId, thread_id: threadId },
      }),
    ]);

    // Everything the user already saw survives: their prompt, the partial
    // answer, and a marker saying it was cut short.
    expect(screen.getByText('hello')).toBeVisible();
    expect(assistantBubble()).toHaveTextContent('half an answer');
    expect(await screen.findByText('Response stopped.')).toBeVisible();

    // The composer is promptable again, empty, with nothing left spinning.
    expect(await screen.findByLabelText('Send message')).toBeVisible();
    expect(screen.getByLabelText('Message input')).toHaveValue('');
    expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Stop generating' })
    ).not.toBeInTheDocument();
  });

  // Stopped before a single token, there is no answer worth keeping, so
  // assistant-ui drops the empty exchange and puts the prompt back in the
  // composer: the thread returns to exactly where it was before Send, one
  // keystroke away from asking again. That is the library's own behaviour for
  // a run cancelled before its first token, and the one we want — nothing is
  // lost, and no blank bubble is left carrying a marker.
  it('hands the prompt back when the run is stopped before its first token', async () => {
    const { user, channel, sendUserMessage } = await renderAIAssistant({
      open: true,
    });
    const { thread_id: threadId, run_id: runId } =
      await sendUserMessage('hello');

    // No server event at all — the run is stopped between the push and the
    // first RUN_STARTED.
    expect(screen.getByText('Thinking...')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Stop generating' }));

    expect(channel.pushed.filter((p) => p.event === 'cancel_run')).toEqual([
      expect.objectContaining({
        payload: { run_id: runId, thread_id: threadId },
      }),
    ]);

    // Back to the empty thread, greeting and all — the exchange is gone from
    // the transcript and only the composer still holds the prompt.
    await waitFor(() => {
      expect(screen.getByText("Hi, I'm Liz.")).toBeVisible();
    });
    expect(assistantBubbles()).toHaveLength(0);
    expect(screen.getByLabelText('Message input')).toHaveValue('hello');
    expect(
      screen.queryByText('hello', { selector: ':not(textarea)' })
    ).toBeNull();
    expect(await screen.findByLabelText('Send message')).toBeVisible();
    expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
  });

  it('keeps the marker on the stopped answer once a follow-up prompt starts a new run', async () => {
    const context = await renderAIAssistant({ open: true });
    const { emitAgUi, sendUserMessage } = context;
    const { threadId, runId } = await streamThenStop(context);

    // The stopped answer gets its own bubble — pin it before a second one
    // exists, so scoping later assertions to "the earlier bubble" is
    // unambiguous.
    const stoppedBubble = assistantBubble();
    expect(within(stoppedBubble).getByText('Response stopped.')).toBeVisible();

    const next = await sendUserMessage('try again');
    await emitAgUi(aguiEvents.runStarted({ threadId, runId: next.run_id }));

    // Stop is not "New chat": the conversation, and the server-side agent
    // holding it, are the same ones.
    expect(next.thread_id).toBe(threadId);
    expect(next.run_id).not.toBe(runId);

    // The spec clause this whole rework exists for: the marker persists on
    // the message it belongs to for the rest of the conversation — the new
    // run must not clear it, and must not carry a marker of its own.
    expect(within(stoppedBubble).getByText('Response stopped.')).toBeVisible();
    const newBubble = assistantBubble();
    expect(newBubble).not.toBe(stoppedBubble);
    expect(
      within(newBubble).queryByText('Response stopped.')
    ).not.toBeInTheDocument();
  });

  it('shows the progress indicator only on the answer in flight, never on an earlier stopped one', async () => {
    const context = await renderAIAssistant({ open: true });
    const { emitAgUi, sendUserMessage } = context;
    const { threadId } = await streamThenStop(context);

    // `isRunning` is thread-scoped, so the next run turns it back on for this
    // bubble too — the spinner has to be pinned to the live answer by
    // something other than the run state.
    const stoppedBubble = assistantBubble();

    const next = await sendUserMessage('try again');
    await emitAgUi(aguiEvents.runStarted({ threadId, runId: next.run_id }));

    expect(await screen.findByText('Thinking...')).toBeVisible();
    expect(screen.getAllByText('Thinking...')).toHaveLength(1);
    expect(
      within(stoppedBubble).queryByText('Thinking...')
    ).not.toBeInTheDocument();
  });

  it('recovers the composer when a cross-tab config change abandons a run that was streaming behind a closed launcher', async () => {
    const { user, channel, sendUserMessage } = await renderAIAssistant({
      open: true,
    });

    await sendUserMessage('hello');
    expect(
      screen.getByRole('button', { name: 'Stop generating' })
    ).toBeVisible();

    // Closing the launcher does not tear the run down — only a cross-tab
    // config change (or a manual "New chat") does.
    await user.click(screen.getByLabelText('Close'));

    await act(async () => {
      channel.emit('ai_configuration_created');
    });

    await user.click(screen.getByRole('button', { name: 'Open AI Assistant' }));

    // The abandoned run must have been settled locally — the reopened pane
    // is promptable again, not still waiting on a run the server already
    // killed.
    expect(await screen.findByLabelText('Send message')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Stop generating' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New chat' })).toBeEnabled();
  });

  it('abandons the thread on the server when the user starts a new chat after an answer', async () => {
    const { user, channel, sendUserMessage, streamAssistantTurn } =
      await renderAIAssistant({ open: true });

    const turn = await sendUserMessage('hello');
    await streamAssistantTurn(turn, { messageId: 'a', deltas: ['an answer'] });

    await user.click(screen.getByRole('button', { name: 'New chat' }));

    // Nothing is streaming — "New chat" is locked while a run is in flight —
    // but the thread's agent survives the run and holds the whole
    // conversation, so the server still has to be told to let it go.
    await waitFor(() => {
      expect(
        channel.pushed.filter((p) => p.event === 'abandon_thread')
      ).toEqual([expect.objectContaining({ payload: {} })]);
    });
    expect(channel.pushed.filter((p) => p.event === 'cancel_run')).toEqual([]);
  });

  it('"New chat" starts a new conversation with a new thread ID', async () => {
    const { user, sendUserMessage, streamAssistantTurn } =
      await renderAIAssistant({ open: true });

    const first = await sendUserMessage('first');
    await streamAssistantTurn(first, { messageId: 'a', deltas: ['one'] });

    await user.click(screen.getByRole('button', { name: 'New chat' }));

    const second = await sendUserMessage('second');

    expect(second.thread_id).not.toBe(first.thread_id);
  });

  it('handles a follow-up turn after the previous one finishes', async () => {
    const { sendUserMessage, streamAssistantTurn } = await renderAIAssistant({
      open: true,
    });

    const first = await sendUserMessage('first');
    await streamAssistantTurn(first, { messageId: 'a', deltas: ['one'] });

    const second = await sendUserMessage('second');
    await streamAssistantTurn(second, { messageId: 'b', deltas: ['two'] });

    // Same conversation, distinct runs
    expect(second.thread_id).toBe(first.thread_id);
    expect(second.run_id).not.toBe(first.run_id);

    await waitFor(() => {
      expect(screen.getByText('first')).toBeInTheDocument();
      expect(screen.getByText('one')).toBeInTheDocument();
      expect(screen.getByText('second')).toBeInTheDocument();
      expect(screen.getByText('two')).toBeInTheDocument();
    });
  });
});
