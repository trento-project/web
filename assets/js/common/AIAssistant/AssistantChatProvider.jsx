// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { noop } from 'lodash';

import { AssistantRuntimeProvider, useAui } from '@assistant-ui/react';
import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';

import { useSocket } from '@common/SocketProvider';
import { WebSocketAIAgent } from '@lib/ai';

// An empty ExportedMessageRepository — what `thread.import()` takes to wipe a
// thread (equivalent to `ExportedMessageRepository.fromArray([])`).
const EMPTY_THREAD = { messages: [] };

function AssistantChatProvider({
  userID,
  threadID,
  onConnectionChange = noop,
  onAIConfigurationCleared = noop,
  onAIConfigurationCreated = noop,
  onModelChanged = noop,
  children,
}) {
  const socket = useSocket();

  const agent = useMemo(() => {
    if (!socket || !userID) return null;
    return new WebSocketAIAgent({ socket, userID });
  }, [socket, userID]);

  useEffect(() => {
    if (!agent) return;
    agent.withCallbacks({
      onConnectionChange,
      onAIConfigurationCleared,
      onAIConfigurationCreated,
      onModelChanged,
    });
  });

  useEffect(() => {
    if (!agent) return undefined;
    // Catch rejections (channel-join error / timeout / missing socket)
    // so they don't bubble up as unhandled promise rejections —
    // onConnectionChange handles flipping the UI to DISCONNECTED
    agent.initialize().catch(noop);
    return () => agent.disconnect();
  }, [agent]);

  useEffect(() => {
    // The AG-UI runtime reads `agent.threadId` when building each run's
    // payload (defaults to "main" if unset). Mutate the live agent instead
    // of rebuilding it so the channel + websocket stay alive across thread
    // changes.
    if (agent) agent.threadId = threadID;
  }, [agent, threadID]);

  // Invoked by the runtime once a run's abort signal has fired, so the
  // transport can tear the run down on the wire too.
  const handleCancel = useCallback(() => agent?.cancelActiveRun(), [agent]);

  const runtime = useAgUiRuntime({ agent, onCancel: handleCancel });
  const aui = useAui();

  // useAgUiRuntime keeps its core (and the message store) in a useRef across
  // re-renders. When threadID changes we keep the same agent (above) but the
  // UI must drop the prior thread's messages explicitly; the first mount is
  // a no-op.
  //
  // `import()`, not `reset()`. The external-store runtime's `reset()` only
  // pushes an empty message list to the store; its own message repository
  // keeps the old thread. `import()` clears that repository synchronously.
  //
  // The server is told separately: the thread's agent outlives its runs and
  // would otherwise hold the whole conversation until the sagents inactivity
  // timeout. Nothing is ever streaming here — "New chat" is locked for the
  // length of a run — so there is no run for the runtime to abort.
  const previousThreadIDRef = useRef(threadID);
  useEffect(() => {
    if (previousThreadIDRef.current === threadID) return;
    previousThreadIDRef.current = threadID;

    runtime.thread.import(EMPTY_THREAD);
    agent?.abandonThread();
  }, [threadID, runtime, agent]);

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

export default AssistantChatProvider;
