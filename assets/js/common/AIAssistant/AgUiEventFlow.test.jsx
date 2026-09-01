// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import copy from 'copy-to-clipboard';
import { renderAIAssistant } from '@lib/test-utils/aiAssistant';
import { aguiEvents } from '@lib/test-utils/aguiEvents';

jest.mock('copy-to-clipboard', () => jest.fn(() => true));

const assistantBubbles = () =>
  Array.from(document.querySelectorAll('[data-role="assistant"]'));

const assistantBubble = () => {
  const nodes = assistantBubbles();
  return nodes[nodes.length - 1] || null;
};

const streamThenStop = async (
  { user, emitAgUi, sendUserMessage },
  delta = 'half an answer'
) => {
  const { thread_id: threadId, run_id: runId } = await sendUserMessage('hello');
  const messageId = 'asst-1';

  await emitAgUi(aguiEvents.runStarted({ threadId, runId }));
  await emitAgUi(aguiEvents.textStart({ messageId }));
  await emitAgUi(aguiEvents.textContent({ messageId, delta }));
  await screen.findByText(delta);

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

  it('marks a streaming answer as stopped when the AI configuration is cleared', async () => {
    const { channel, emitAgUi, sendUserMessage } = await renderAIAssistant({
      open: true,
    });
    const { thread_id: threadId, run_id: runId } =
      await sendUserMessage('hello');
    const messageId = 'asst-1';

    await emitAgUi(aguiEvents.runStarted({ threadId, runId }));
    await emitAgUi(aguiEvents.textStart({ messageId }));
    await emitAgUi(
      aguiEvents.textContent({ messageId, delta: 'half an answer' })
    );
    await waitFor(() => {
      expect(assistantBubble()).toHaveTextContent('half an answer');
    });

    await act(async () => {
      channel.emit('ai_configuration_cleared');
    });

    expect(assistantBubble()).toHaveTextContent('half an answer');
    expect(
      await within(assistantBubble()).findByText('Response stopped.')
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Stop generating' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('AI Assistant is disabled')
    ).toBeDisabled();
  });

  const emitModelChange = (channel) =>
    act(async () => {
      channel.emit('model_changed', {
        provider: 'google',
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
    await streamThenStop(context);

    expect(
      context.channel.pushed.filter((p) => p.event === 'cancel_run')
    ).toEqual([expect.objectContaining({ payload: {} })]);

    expect(screen.getByText('hello')).toBeVisible();
    expect(assistantBubble()).toHaveTextContent('half an answer');
    expect(
      within(assistantBubble()).getByText('Response stopped.')
    ).toBeVisible();

    // The composer is promptable again, empty, with nothing left spinning.
    expect(screen.getByLabelText('Message input')).toHaveValue('');
    expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Stop generating' })
    ).not.toBeInTheDocument();
  });

  it('prompt is sent back to the composer when the run is stopped before its first token', async () => {
    const { user, channel, sendUserMessage } = await renderAIAssistant({
      open: true,
    });
    await sendUserMessage('hello');

    // No server event. The run is stopped between the push and the first RUN_STARTED.
    expect(await screen.findByText('Thinking...')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Stop generating' }));

    expect(channel.pushed.filter((p) => p.event === 'cancel_run')).toEqual([
      expect.objectContaining({ payload: {} }),
    ]);

    await waitFor(() => {
      expect(assistantBubbles()).toHaveLength(0);
    });
    expect(screen.getByLabelText('Message input')).toHaveValue('hello');
    expect(await screen.findByLabelText('Send message')).toBeVisible();
  });

  it('keeps the marker on the stopped answer once a follow-up prompt starts a new run', async () => {
    const context = await renderAIAssistant({ open: true });
    const { emitAgUi, sendUserMessage } = context;
    const { threadId, runId } = await streamThenStop(context);

    const stoppedBubble = assistantBubble();
    expect(within(stoppedBubble).getByText('Response stopped.')).toBeVisible();

    const next = await sendUserMessage('try again');
    await emitAgUi(aguiEvents.runStarted({ threadId, runId: next.run_id }));

    // same thread, different run
    expect(next.thread_id).toBe(threadId);
    expect(next.run_id).not.toBe(runId);

    // stopped marker remains on the old bubble, and new bubble is clean
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

    const stoppedBubble = assistantBubble();

    const next = await sendUserMessage('try again');
    await emitAgUi(aguiEvents.runStarted({ threadId, runId: next.run_id }));

    expect(await screen.findByText('Thinking...')).toBeVisible();
    expect(screen.getAllByText('Thinking...')).toHaveLength(1);
    expect(
      within(stoppedBubble).queryByText('Thinking...')
    ).not.toBeInTheDocument();
  });

  it('starts over when a cross-tab config swap lands on a run streaming behind a closed launcher', async () => {
    const { user, channel, sendUserMessage } = await renderAIAssistant({
      open: true,
    });

    await sendUserMessage('hello');
    expect(
      screen.getByRole('button', { name: 'Stop generating' })
    ).toBeVisible();

    // Closing the launcher does not tear the run down
    await user.click(screen.getByLabelText('Close'));

    await act(async () => {
      // this settles the run, but the user has no way to see that yet
      channel.emit('ai_configuration_cleared');
    });
    await act(async () => {
      // this re-enables the launcher
      channel.emit('ai_configuration_created');
    });

    await user.click(screen.getByRole('button', { name: 'Open AI Assistant' }));

    // after opening again the chat modal, we start from a clean state
    expect(await screen.findByText("Hi, I'm Liz.")).toBeVisible();
    expect(await screen.findByLabelText('Send message')).toBeVisible();
    expect(screen.getByRole('button', { name: 'New chat' })).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: 'Stop generating' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('hello')).not.toBeInTheDocument();
  });

  describe('Copying replies', () => {
    it('allows copying the last reply only once the run has finished', async () => {
      const { emitAgUi, sendUserMessage } = await renderAIAssistant({
        open: true,
      });
      const { thread_id: threadId, run_id: runId } = await sendUserMessage(
        'how many hosts are healthy?'
      );

      const messageId = 'asst-1';
      await emitAgUi(aguiEvents.runStarted({ threadId, runId }));
      await emitAgUi(aguiEvents.textStart({ messageId }));
      await emitAgUi(
        aguiEvents.textContent({ messageId, delta: 'All **3** ' })
      );

      const copyReplyButton = () =>
        screen.queryByRole('button', { name: 'copy to clipboard' });

      await waitFor(() => expect(assistantBubble()).toHaveTextContent('All'));
      expect(copyReplyButton()).not.toBeInTheDocument();

      await emitAgUi(
        aguiEvents.textContent({ messageId, delta: 'are healthy.' })
      );
      await emitAgUi(aguiEvents.textEnd({ messageId }));
      await emitAgUi(aguiEvents.runFinished({ threadId, runId }));

      await waitFor(() => expect(copyReplyButton()).toBeVisible());
    });

    it('allows copying the answer the user stopped', async () => {
      const context = await renderAIAssistant({ open: true });
      const { user } = context;
      await streamThenStop(context);

      const stoppedBubble = assistantBubble();
      const copyReplyButton = await within(stoppedBubble).findByRole('button', {
        name: 'copy to clipboard',
      });

      await user.click(copyReplyButton);

      expect(copy).toHaveBeenCalledWith('half an answer', expect.anything());
    });

    it('allows copying an earlier reply while a new run is streaming', async () => {
      const { user, emitAgUi, sendUserMessage, streamAssistantTurn } =
        await renderAIAssistant({ open: true });

      const first = await sendUserMessage('first');
      await streamAssistantTurn(first, { messageId: 'a', deltas: ['one'] });

      const earlierReplyCopyButton = () =>
        within(assistantBubbles()[0]).queryByRole('button', {
          name: 'copy to clipboard',
        });

      await waitFor(() => expect(earlierReplyCopyButton()).toBeVisible());

      const second = await sendUserMessage('second');
      await emitAgUi(
        aguiEvents.runStarted({
          threadId: second.thread_id,
          runId: second.run_id,
        })
      );

      expect(await screen.findByText('Thinking...')).toBeVisible();
      expect(earlierReplyCopyButton()).toBeVisible();

      await user.click(earlierReplyCopyButton());

      expect(copy).toHaveBeenCalledWith('one', expect.anything());
    });

    it('copies a specific reply in the conversation', async () => {
      const { user, sendUserMessage, streamAssistantTurn } =
        await renderAIAssistant({ open: true });

      const first = await sendUserMessage('first');
      await streamAssistantTurn(first, { messageId: 'a', deltas: ['one'] });
      const second = await sendUserMessage('second');
      await streamAssistantTurn(second, { messageId: 'b', deltas: ['two'] });

      await waitFor(() => expect(assistantBubbles()).toHaveLength(2));

      const earlierReply = assistantBubbles()[0];
      await user.click(
        within(earlierReply).getByRole('button', { name: 'copy to clipboard' })
      );

      expect(copy).toHaveBeenCalledWith('one', expect.anything());
    });
  });

  it('allows retrying the last reply only', async () => {
    const { sendUserMessage, streamAssistantTurn } = await renderAIAssistant({
      open: true,
    });

    const first = await sendUserMessage('first');
    await streamAssistantTurn(first, { messageId: 'a', deltas: ['one'] });

    const second = await sendUserMessage('second');
    await streamAssistantTurn(second, { messageId: 'b', deltas: ['two'] });

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'retry' })).toHaveLength(1)
    );

    const [earlier, latest] = assistantBubbles();
    expect(
      within(earlier).queryByRole('button', { name: 'retry' })
    ).not.toBeInTheDocument();
    expect(within(latest).getByRole('button', { name: 'retry' })).toBeVisible();
  });

  it('"New chat" starts a new conversation with a new thread ID', async () => {
    const { user, sendUserMessage, streamAssistantTurn } =
      await renderAIAssistant({ open: true });

    const first = await sendUserMessage('first');
    await streamAssistantTurn(first, { messageId: 'a', deltas: ['one'] });

    expect(await screen.findByText('one')).toBeVisible();
    expect(screen.getByText('first')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'New chat' }));

    await waitFor(() => {
      expect(screen.queryByText('first')).not.toBeInTheDocument();
      expect(screen.queryByText('one')).not.toBeInTheDocument();
    });

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
