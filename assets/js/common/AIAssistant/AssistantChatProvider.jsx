// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useRef } from 'react';
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

  // Built unconditionally, even without a socket or a userID: the AG-UI
  // runtime dereferences the agent while constructing its core
  // (`installResumeShim`) and types it as non-nullable, so handing it a null
  // throws. An agent with no socket is inert anyway — `initialize()` refuses
  // one, so nothing connects and no channel is ever opened.
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
    });
  });

  useEffect(() => {
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
    agent.threadId = threadID;
  }, [agent, threadID]);

  // The composer's Stop is `ComposerPrimitive.Cancel`, and this is where it
  // lands: useAgUiRuntime wires the store's cancel to its own core, which
  // calls `agent.abortRun()` — our override pushes `cancel_run` — and then
  // dispatches RUN_CANCELLED so the answer is marked as stopped. Nothing of
  // ours has to be threaded through for that.
  const runtime = useAgUiRuntime({ agent });
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
  // timeout. The header's "New chat" is locked for the length of a run, but a
  // cross-tab `ai_configuration_created` can also mint a new threadID while
  // the launcher is closed, with a run genuinely still streaming — so this
  // effect never branches on run state itself; the transport (`abandonThread`)
  // settles any in-flight run on its own.
  const previousThreadIDRef = useRef(threadID);
  useEffect(() => {
    if (previousThreadIDRef.current === threadID) return;
    previousThreadIDRef.current = threadID;

    runtime.thread.import(EMPTY_THREAD);
    agent.abandonThread();
  }, [threadID, runtime, agent]);

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

export default AssistantChatProvider;
