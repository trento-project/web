// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { noop } from 'lodash';

import { AssistantRuntimeProvider, useAui } from '@assistant-ui/react';
import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';

import { useSocket } from '@common/SocketProvider';
import { WebSocketAIAgent } from '@lib/ai';

import { StoppedRunProvider } from './StoppedRunProvider';

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

  // Stop does NOT go through the runtime's cancel path (`onCancel` /
  // `ComposerPrimitive.Cancel` / `thread.cancelRun()`): that path resyncs a
  // stale message snapshot and wedges `thread.isRunning` permanently
  // (`@assistant-ui/core` external-store defect), and the AG-UI subscriber's
  // synthesized `RUN_FINISHED` on settle clobbers `incomplete/cancelled`
  // before anything can read it (`@assistant-ui/react-ag-ui` defect). Both
  // are confirmed library defects with no supported extension point — see
  // StoppedRunProvider, which drives Stop from our own state instead.
  const runtime = useAgUiRuntime({ agent });
  const aui = useAui();

  const handleStop = useCallback(() => agent?.cancelActiveRun(), [agent]);

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
    agent?.abandonThread();
  }, [threadID, runtime, agent]);

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      <StoppedRunProvider onStop={handleStop}>{children}</StoppedRunProvider>
    </AssistantRuntimeProvider>
  );
}

export default AssistantChatProvider;
