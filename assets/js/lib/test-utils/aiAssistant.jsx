// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SocketContext } from '@common/SocketProvider';
import AIAssistant from '@common/AIAssistant';

import { renderWithRouter } from '@lib/test-utils';
import { buildAssistantTurn } from '@lib/test-utils/aguiEvents';
import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';

export async function renderAIAssistant({
  open = false,
  userID = '1',
  ...props
} = {}) {
  const socket = makeMockSocket();

  const utils = renderWithRouter(
    <SocketContext.Provider value={socket}>
      <AIAssistant userID={userID} open={open} {...props} />
    </SocketContext.Provider>
  );

  const channel = await waitFor(() => {
    const openedChannel = socket.channels.get(`ai_assistant:${userID}`);
    if (!openedChannel) throw new Error('channel not opened yet');
    return openedChannel;
  });

  // Complete the channel join handshake — the agent transitions to 'connected'.
  await act(async () => {
    channel.joinPush.fire('ok');
  });

  if (open) await screen.findByLabelText('Message input');

  const user = userEvent.setup();

  // Fire one AG-UI event on the channel and let the runtime settle.
  const emitAgUi = async (event) => {
    await act(async () => {
      channel.emit('ag_ui_event', event);
    });
  };

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

  // first argument is the payload sendUserMessage returned, so the streamed run is
  // always correlated with the send that started it
  const streamAssistantTurn = async (
    { thread_id: threadId, run_id: runId },
    params
  ) => {
    for (const event of buildAssistantTurn({ threadId, runId, ...params })) {
      await emitAgUi(event);
    }
    return params.messageId;
  };

  return {
    ...utils,
    user,
    socket,
    channel,
    emitAgUi,
    sendUserMessage,
    streamAssistantTurn,
  };
}

export default renderAIAssistant;
