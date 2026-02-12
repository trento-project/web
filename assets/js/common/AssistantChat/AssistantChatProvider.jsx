import {
  AssistantRuntimeProvider,
  Tools,
  useAui,
} from '@assistant-ui/react';
import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CustomHttpAgent } from './CustomHttpAgent';

export function AssistantChatProvider({ children }) {
  // AG-UI agent URL pointing to your backend
  const agentUrl = 'http://localhost:8081/api/agent';

  // In-memory thread storage for multi-thread support
  const threadsRef = useRef(new Map());
  const [currentThreadId, setCurrentThreadId] = useState(() => {
    const id = crypto.randomUUID();
    threadsRef.current.set(id, { id, messages: [] });
    return id;
  });

  // Create HttpAgent for AG-UI protocol with custom context injection
  const agent = useMemo(() => {
    return new CustomHttpAgent({
      url: agentUrl,
      threadId: currentThreadId,
      headers: {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
    },
    );
  }, [agentUrl, currentThreadId]);

  // Setup thread list adapter for multi-thread support
  const threadListAdapter = useMemo(
    () => ({
      threadId: currentThreadId,
      onSwitchToNewThread: async () => {
        const newId = crypto.randomUUID();
        threadsRef.current.set(newId, { id: newId, messages: [] });
        setCurrentThreadId(newId);
        console.debug('[ag-ui] Switched to new thread:', newId);
      },
      onSwitchToThread: async (threadId) => {
        const thread = threadsRef.current.get(threadId);
        if (!thread) {
          throw new Error(`Thread ${threadId} not found`);
        }
        setCurrentThreadId(threadId);
        console.debug('[ag-ui] Switched to thread:', threadId);
        return { messages: thread.messages };
      },
    }),
    [currentThreadId]
  );

  // Create AG-UI runtime
  const runtime = useAgUiRuntime({
    agent,
    logger: {
      debug: (...a) => console.debug('[ag-ui]', ...a),
      error: (...a) => console.error('[ag-ui]', ...a),
    },
    adapters: {
      threadList: threadListAdapter,
    },
  });


  // Define your toolkit
  const myToolkit = {
    browser_message: {
      description: 'Display a native browser alert dialog to the user.',
      // parameters: z.object({
      //   selector: z.string().optional(),
      // }),
      parameters: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Text to display inside the alert dialog.',
          },
        },
        required: ['message'],
      },
      // execute: async ({ message }) => {
        // debugger;
        // console.log('Executing browser alert with message:', message);
        // window.alert(message);
        // return { status: 'shown' };
      // },
      render: ({ args, result }) => {
        console.log('Executing (not really) browser alert with message:', args.message);
        // window.location.href = "/hosts";
        return ((
          <div className="mt-3 w-full max-w-[var(--thread-max-width)] rounded-lg border px-4 py-3 text-sm">
            <p className="font-semibold text-muted-foreground">Tool result</p>
            <p className="mt-1">
              Requested alert with message:
              <span className="ml-1 font-mono text-foreground">
                {JSON.stringify(args.message)}
              </span>
            </p>
            {result?.status === 'shown' && (
              <p className="mt-2 text-foreground/70 text-xs">
                Alert displayed in this tab.
              </p>
            )}
          </div>
        ));
      },
    },
    // Add more tools here
  };

  // Register all tools
  const aui = useAui({
    tools: Tools({ toolkit: myToolkit }),
  });

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
