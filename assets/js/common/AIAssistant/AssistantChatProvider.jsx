import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { noop } from 'lodash';

import { AssistantRuntimeProvider, useAui } from '@assistant-ui/react';
import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';
import { useSelector } from 'react-redux';

import { useSocket } from '@common/SocketProvider';
import { CONNECTION_STATUS, WebSocketAIAgent } from '@lib/ai';
import { getUserProfile } from '@state/selectors/user';

import { ConnectionStatusContext } from './connectionStatusContext';
import { ResetThreadContext } from './resetThreadContext';

export function AssistantChatProvider({ children }) {
  const userId = useSelector(getUserProfile)?.id;
  const socket = useSocket();
  const [connectionStatus, setConnectionStatus] = useState(
    CONNECTION_STATUS.DISCONNECTED
  );
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());

  const resetThread = useCallback(() => {
    setThreadId(crypto.randomUUID());
  }, []);

  const agent = useMemo(() => {
    if (!socket || !userId) return null;
    return new WebSocketAIAgent({
      socket,
      userId,
      threadId,
      onConnectionChange: setConnectionStatus,
    });
  }, [socket, userId, threadId]);

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

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      <ConnectionStatusContext.Provider value={connectionStatus}>
        <ResetThreadContext.Provider value={resetThread}>
          {children}
        </ResetThreadContext.Provider>
      </ConnectionStatusContext.Provider>
    </AssistantRuntimeProvider>
  );
}
