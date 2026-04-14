import React, { useEffect, useMemo, useRef, useState } from 'react';

import { HttpAgent } from '@ag-ui/client';
import { AssistantRuntimeProvider, useAui } from '@assistant-ui/react';
import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';
// import { CustomHttpAgent } from './CustomHttpAgent';

export function AssistantChatProvider({ children }) {
  // AG-UI agent URL pointing to your backend
  const agentUrl = '/api/v1/ai_agent';

  // // In-memory thread storage for multi-thread support
  const threadsRef = useRef(new Map());
  const [currentThreadId, setCurrentThreadId] = useState(() => {
    const id = crypto.randomUUID();
    threadsRef.current.set(id, { id, messages: [] });
    return id;
  });

  // Create HttpAgent for AG-UI protocol with custom context injection
  const agent = useMemo(() => {
    return new HttpAgent({
      url: agentUrl,
      threadId: currentThreadId,
      headers: {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
    });
  }, [agentUrl, currentThreadId]);

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
    return runtime.thread.subscribe(() => {
      threadsRef.current.set(currentThreadId, {
        id: currentThreadId,
        messages: runtime.thread.getState().messages,
      });
    });
  }, [runtime, currentThreadId]);

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
