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
  children,
}) {
  const socket = useSocket();

  const agent = useMemo(() => {
    if (!socket || !userID) return null;
    // AG-UI's AgentConfig field is `threadId` (camel) — translate.
    return new WebSocketAIAgent({
      socket,
      userID,
      threadId: threadID,
      onConnectionChange,
    });
  }, [socket, userID, threadID, onConnectionChange]);

  useEffect(() => {
    if (!agent) return undefined;
    // Catch rejections (channel-join error / timeout / missing socket)
    // so they don't bubble up as unhandled promise rejections —
    // onConnectionChange handles flipping the UI to DISCONNECTED
    agent.initialize().catch(noop);
    return () => agent.disconnect();
  }, [agent]);

  const runtime = useAgUiRuntime({ agent });
  const aui = useAui();

  // useAgUiRuntime keeps its core (and the message store) in a useRef across
  // agent swaps, so bumping threadID rebuilds the agent + websocket but
  // leaves the prior thread's messages onscreen. Wipe them explicitly when
  // the thread id actually changes; the first mount is a no-op.
  const previousThreadIDRef = useRef(threadID);
  useEffect(() => {
    if (previousThreadIDRef.current === threadID) return;
    previousThreadIDRef.current = threadID;
    runtime.thread.reset();
  }, [threadID, runtime]);

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

export default AssistantChatProvider;
