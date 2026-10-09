// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useRef } from 'react';
import { noop } from 'lodash';

import { AssistantRuntimeProvider, useAui } from '@assistant-ui/react';
import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';

import { useSocket } from '@common/SocketProvider';
import { WebSocketAIAgent } from '@lib/ai';

function AssistantChatProvider({
  userID,
  threadID,
  onConnectionChange = noop,
  onAIConfigurationCleared = noop,
  onAIConfigurationCreated = noop,
  onModelChanged = noop,
  onConversationExpired = noop,
  children,
}) {
  const socket = useSocket();

  const agent = useMemo(
    () => new WebSocketAIAgent({ socket, userID }),
    [socket, userID]
  );

  useEffect(() => {
    agent.withCallbacks({
      onConnectionChange,
      onAIConfigurationCleared,
      onAIConfigurationCreated,
      onModelChanged,
      onConversationExpired,
    });
  });

  useEffect(() => {
    // The AG-UI runtime reads `agent.threadId` when building each run's
    // payload (defaults to "main" if unset). Mutate the live agent instead
    // of rebuilding it so the channel + websocket stay alive across thread
    // changes. Declared before `initialize()` so the first join names this thread.
    agent.threadId = threadID;
  }, [agent, threadID]);

  useEffect(() => {
    // Catch rejections (channel-join error / timeout / missing socket)
    // so they don't bubble up as unhandled promise rejections —
    // onConnectionChange handles flipping the UI to DISCONNECTED
    agent.initialize().catch(noop);
    return () => agent.disconnect();
  }, [agent]);

  const runtime = useAgUiRuntime({ agent });
  const aui = useAui();

  // useAgUiRuntime keeps its core (and the message store) in a useRef across
  // re-renders. When threadID changes we keep the same agent (above) but the
  // UI must drop the prior thread's messages explicitly; the first mount is
  // a no-op.
  const previousThreadIDRef = useRef(threadID);
  useEffect(() => {
    if (previousThreadIDRef.current === threadID) return;
    previousThreadIDRef.current = threadID;

    runtime.thread.reset();
    agent.abandonThread();
  }, [threadID, runtime, agent]);

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

export default AssistantChatProvider;
