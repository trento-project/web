import { useCallback, useMemo, useRef, useState } from 'react';

// In-memory multi-thread message store paired with the thread-list adapter
// shape that `useAgUiRuntime` consumes. Keeps the AssistantChatProvider
// focused on runtime wiring and makes the storage logic testable in isolation.
export function useThreadStore() {
  const threadsRef = useRef(new Map());
  const seedNewThread = useCallback(() => {
    const id = crypto.randomUUID();
    threadsRef.current.set(id, { id, messages: [] });
    return id;
  }, []);

  const [currentThreadId, setCurrentThreadId] = useState(seedNewThread);

  const persist = useCallback(
    (messages) => {
      threadsRef.current.set(currentThreadId, {
        id: currentThreadId,
        messages,
      });
    },
    [currentThreadId]
  );

  const adapter = useMemo(
    () => ({
      threadId: currentThreadId,
      onSwitchToNewThread: async () => {
        setCurrentThreadId(seedNewThread());
      },
      onSwitchToThread: async (threadId) => {
        const thread = threadsRef.current.get(threadId);
        if (!thread) throw new Error(`Thread ${threadId} not found`);
        setCurrentThreadId(threadId);
        return { messages: thread.messages };
      },
    }),
    [currentThreadId, seedNewThread]
  );

  return { adapter, persist };
}
