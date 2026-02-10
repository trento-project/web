import React, { createContext, useContext, useState, useCallback } from 'react';

// Initialize the context with default values
const AIAssistantContext = createContext({
  context: null,
  setContext: () => {},
});

// Provider component for the AI Assistant context
export function AIAssistantProvider({ children }) {
  const [context, setContextState] = useState(null);

  const setContext = useCallback((newContext) => {
    setContextState(newContext);
  }, []);

  return (
    <AIAssistantContext.Provider value={{ context, setContext }}>
      {children}
    </AIAssistantContext.Provider>
  );
}

// Custom hook to use the context
export function useAIAssistantContext() {
  return useContext(AIAssistantContext);
}
