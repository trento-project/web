// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderAIAssistant } from '@lib/test-utils/aiAssistant';
import { aguiEvents } from '@lib/test-utils/aguiEvents';

const assistantBubble = () => {
  const nodes = document.querySelectorAll('[data-role="assistant"]');
  return nodes[nodes.length - 1] || null;
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
