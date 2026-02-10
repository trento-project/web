import { useEffect, useRef } from 'react';
import { useAIAssistantContext } from '../contexts/AIAssistantContext';

// Safely stringify a value, returning undefined on failure
const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch (_error) {
    return undefined;
  }
};

// Custom hook to provide page context to the AI Assistant
export default function useAIContext(contextData) {
  const { setContext } = useAIAssistantContext();
  const prevHashRef = useRef();

  // Update context when contextData changes
  useEffect(() => {
    const nextHash = safeStringify(contextData);
    // Only update if the context has changed
    if (nextHash && nextHash !== prevHashRef.current) {
      prevHashRef.current = nextHash;
      setContext(contextData);
    }
  }, [contextData, setContext]);
}
