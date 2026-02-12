import { useEffect, useRef } from 'react';

/**
 * Global context store for the assistant
 * This persists across page changes and is accessible to the runtime
 */
export const assistantContextStore = {
  current: {
    page: null,
    data: {},
    timestamp: null,
  },

  set(context) {
    this.current = {
      ...this.current,
      ...context,
      timestamp: new Date().toISOString(),
    };

    // Also store in sessionStorage for cross-tab access
    try {
      sessionStorage.setItem(
        'assistantPageContext',
        JSON.stringify(this.current)
      );
    } catch (e) {
      console.warn('Could not store context in sessionStorage:', e);
    }
  },

  get() {
    return this.current;
  },

  clear() {
    this.current = {
      page: null,
      data: {},
      timestamp: null,
    };
    sessionStorage.removeItem('assistantPageContext');
  },
};

/**
 * Hook that integrates page context with AG-UI
 * Call this in any page component to automatically track context
 */
export function useAssistantContext(pageName, pageData) {
  const previousContextRef = useRef(null);

  // Support both patterns
  const context = {
    page: pageName,
    data: pageData,
  };

  // Update context store when context changes
  useEffect(() => {
    // Only update if something actually changed
    if (
      JSON.stringify(previousContextRef.current) !== JSON.stringify(context)
    ) {
      assistantContextStore.set(context);
      previousContextRef.current = context;
    }
  }, [context]);

  return assistantContextStore.get();
}

/**
 * Helper to get current context from anywhere in the app
 * Useful for middleware, interceptors, or before-send hooks
 *
 * @example
 * const context = getAssistantContext();
 * console.log(context.page); // 'users'
 */
export function getAssistantContext() {
  return assistantContextStore.get();
}
