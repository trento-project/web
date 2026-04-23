import React, { useEffect, useMemo, useRef, useState } from 'react';

import { AssistantRuntimeProvider, useAui } from '@assistant-ui/react';
import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';
import { WebSocketAIAgent } from './WebSocketAIAgent';
import { getSocketInstance, initSocketConnection } from '@lib/network/socket';
import { useSelector } from 'react-redux';
import { getUserProfile } from '@state/selectors/user';

export function AssistantChatProvider({ children }) {
  const user = useSelector(getUserProfile);
  const userId = user?.id;

  // Phoenix socket instance (singleton)
  const socketRef = useRef(null);

  // Track when socket is ready
  const [socketReady, setSocketReady] = useState(false);

  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Initialize Phoenix socket
  useEffect(() => {
    if (!userId) {
      setSocketReady(false);
      return;
    }

    // Try to get existing socket first (created by Redux saga)
    let socket = getSocketInstance();

    // If no socket exists yet, create one
    // This ensures the socket is available even if saga hasn't run yet
    if (!socket) {
      socket = initSocketConnection();
    }

    socketRef.current = socket;
    setSocketReady(true);

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        // Don't disconnect the socket as it's shared across the app
        // socketRef.current.disconnect();
      }
      setSocketReady(false);
    };
  }, [userId]);

  // In-memory thread storage for multi-thread support
  const threadsRef = useRef(new Map());
  const [currentThreadId, setCurrentThreadId] = useState(() => {
    const id = crypto.randomUUID();
    threadsRef.current.set(id, { id, messages: [] });
    return id;
  });

  // Create WebSocketAIAgent for AG-UI protocol
  const agent = useMemo(() => {
    if (!socketReady || !socketRef.current) {
      return null;
    }

    if (!userId) {
      return null;
    }

    return new WebSocketAIAgent({
      socket: socketRef.current,
      userId,
      threadId: currentThreadId,
      onConnectionChange: (status) => {
        setConnectionStatus(status);
      },
    });
  }, [socketReady, userId, currentThreadId]);

  // Initialize agent connection when agent is created
  useEffect(() => {
    if (!agent) {
      return;
    }

    agent
      .initialize()
      .then(() => {
        // Agent initialized successfully
      })
      .catch((_error) => {
        // Try to reconnect after a delay
        setTimeout(() => {
          agent.initialize().catch(() => {
            // Retry failed
          });
        }, 2000);
      });

    // Cleanup on unmount
    return () => {
      if (agent) {
        agent.disconnect();
      }
    };
  }, [agent]);

  // Setup thread list adapter for multi-thread support
  const threadListAdapter = useMemo(
    () => ({
      threadId: currentThreadId,
      onSwitchToNewThread: async () => {
        const newId = crypto.randomUUID();
        threadsRef.current.set(newId, { id: newId, messages: [] });
        setCurrentThreadId(newId);
      },
      onSwitchToThread: async (threadId) => {
        const thread = threadsRef.current.get(threadId);
        if (!thread) {
          throw new Error(`Thread ${threadId} not found`);
        }
        setCurrentThreadId(threadId);
        return { messages: thread.messages };
      },
    }),
    [currentThreadId]
  );

  // Create AG-UI runtime
  const runtime = useAgUiRuntime({
    agent,
    // logger: {
    //   debug: (...a) => console.debug('[ag-ui]', ...a),
    //   error: (...a) => console.error('[ag-ui]', ...a),
    // },
    adapters: {
      threadList: threadListAdapter,
    },
  });

  // Register all tools
  const aui = useAui();

  // Persist messages to threadsRef when they change
  useEffect(() => {
    if (!runtime) return;

    return runtime.thread.subscribe(() => {
      threadsRef.current.set(currentThreadId, {
        id: currentThreadId,
        messages: runtime.thread.getState().messages,
      });
    });
  }, [runtime, currentThreadId]);

  // Always render children (including trigger button), even if agent isn't ready yet
  // The runtime will handle gracefully if agent is null
  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      <ConnectionStatusContext.Provider value={connectionStatus}>
        {children}
      </ConnectionStatusContext.Provider>
    </AssistantRuntimeProvider>
  );
}

// Context for connection status
const ConnectionStatusContext = React.createContext('disconnected');

// Hook to access connection status in child components
export function useAIConnectionStatus() {
  return React.useContext(ConnectionStatusContext);
}
