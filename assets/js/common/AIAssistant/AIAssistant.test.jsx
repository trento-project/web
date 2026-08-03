// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import { renderAIAssistant } from '@lib/test-utils/aiAssistant';
import { SocketContext } from '@common/SocketProvider';
import { WebSocketAIAgent } from '@lib/ai';

import AIAssistant from './AIAssistant';

const enabledTrigger = () =>
  screen.getByRole('button', { name: 'Open AI Assistant' });
const findEnabledTrigger = () =>
  screen.findByRole('button', { name: 'Open AI Assistant' });
const findDisabledTrigger = () =>
  screen.findByRole('button', { name: 'AI Assistant is disabled' });

describe('AIAssistant', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a disabled launcher button when the user has no AI settings', async () => {
    await act(async () => {
      renderWithRouter(
        <SocketContext.Provider value={null}>
          <AIAssistant userID="1" aiConfigured={false} />
        </SocketContext.Provider>
      );
    });

    expect(await findDisabledTrigger()).toBeDisabled();
  });

  it('keeps the channel alive across opening and closing the launcher', async () => {
    const user = userEvent.setup();
    const { channel } = await renderAIAssistant({ open: false });
    const disconnect = jest.spyOn(WebSocketAIAgent.prototype, 'disconnect');

    await user.click(enabledTrigger());
    await screen.findByLabelText('Message input');
    await user.click(screen.getByLabelText('Close'));

    expect(disconnect).not.toHaveBeenCalled();
    expect(channel.listeners.get('ag_ui_event')).toHaveLength(1);
  });

  describe('when the configuration changes while the launcher is closed', () => {
    it('disables the launcher when the configuration is cleared', async () => {
      const { channel } = await renderAIAssistant({
        open: false,
        aiConfigured: true,
      });

      expect(enabledTrigger()).toBeEnabled();

      await act(async () => {
        channel.emit('ai_configuration_cleared');
      });

      expect(await findDisabledTrigger()).toBeDisabled();
    });

    it('re-enables the launcher when a configuration is created', async () => {
      const user = userEvent.setup();
      const { channel } = await renderAIAssistant({
        open: false,
        aiConfigured: false,
      });

      await act(async () => {
        channel.emit('ai_configuration_created');
      });

      const trigger = await findEnabledTrigger();
      expect(trigger).toBeEnabled();

      await user.click(trigger);

      const input = await screen.findByLabelText('Message input');
      await waitFor(() => expect(input).not.toBeDisabled());
      expect(
        screen.queryByText(/new AI configuration is available/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('when the configuration changes after the launcher was opened', () => {
    it('prompts to restart the chat without discarding the conversation', async () => {
      const { channel, user, sendUserMessage, streamAssistantTurn } =
        await renderAIAssistant({ open: false });

      await user.click(enabledTrigger());
      const turn = await sendUserMessage('what is a cluster?');
      await streamAssistantTurn(turn, {
        messageId: 'a',
        deltas: ['a group of hosts'],
      });

      await act(async () => {
        channel.emit('ai_configuration_cleared');
      });
      await waitFor(() =>
        expect(screen.getByLabelText('Message input')).toBeDisabled()
      );

      await act(async () => {
        channel.emit('ai_configuration_created');
      });

      expect(
        await screen.findByText(/new AI configuration is available/i)
      ).toBeInTheDocument();
      // The stale-closure branch swaps threadID, which empties the thread
      expect(screen.getByText('what is a cluster?')).toBeInTheDocument();
      expect(await screen.findByText('a group of hosts')).toBeInTheDocument();
    });
  });
});
