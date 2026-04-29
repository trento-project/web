import React, { useEffect, useMemo, useState } from 'react';

import { AssistantRuntimeProvider, useAui } from '@assistant-ui/react';
import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';
import { useSelector } from 'react-redux';

import { useSocket } from '@common/SocketProvider';
import { CONNECTION_STATUS, WebSocketAIAgent } from '@lib/ai';
import { getUserProfile } from '@state/selectors/user';

import { useThreadStore } from './useThreadStore';

export function AssistantChatProvider({ children }) {
  const userId = useSelector(getUserProfile)?.id;
  const socket = useSocket();
  const [connectionStatus, setConnectionStatus] = useState(
    CONNECTION_STATUS.DISCONNECTED
  );
  const { adapter: threadListAdapter, persist } = useThreadStore();

  const agent = useMemo(() => {
    if (!socket || !userId) return null;
    return new WebSocketAIAgent({
      socket,
      userId,
      threadId: threadListAdapter.threadId,
      onConnectionChange: setConnectionStatus,
    });
  }, [socket, userId, threadListAdapter.threadId]);

  useEffect(() => {
    if (!agent) return undefined;
    // Agent owns its own reconnect/backoff loop; we just kick it off and
    // tear it down on unmount.
    agent.initialize();
    return () => agent.disconnect();
  }, [agent]);

  const runtime = useAgUiRuntime({
    agent,
    adapters: { threadList: threadListAdapter },
  });
  const aui = useAui();

  useEffect(() => {
    if (!runtime) return undefined;
    return runtime.thread.subscribe(() => {
      persist(runtime.thread.getState().messages);
    });
  }, [runtime, persist]);

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      <ConnectionStatusContext.Provider value={connectionStatus}>
        {children}
      </ConnectionStatusContext.Provider>
    </AssistantRuntimeProvider>
  );
}

const ConnectionStatusContext = React.createContext(
  CONNECTION_STATUS.DISCONNECTED
);

export function useAIConnectionStatus() {
  return React.useContext(ConnectionStatusContext);
}
