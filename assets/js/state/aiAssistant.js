/**
 * Redux slice for AI Assistant state (optional)
 *
 * This is an OPTIONAL Redux integration for tracking AI Assistant
 * connection status globally across the application.
 *
 * The AI Assistant works fine without this - connection status is
 * available via the useAIConnectionStatus() hook within the
 * AssistantChatProvider component tree.
 *
 * Use this Redux integration if you need to:
 * - Show connection status outside the AssistantChatProvider tree
 * - Display global notifications when connection changes
 * - Track connection metrics/analytics
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connectionStatus: 'disconnected', // 'connected' | 'connecting' | 'disconnected'
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  connectionErrors: [],
};

const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    aiConnectionStatusChanged: (state, action) => {
      const newStatus = action.payload;
      const previousStatus = state.connectionStatus;

      state.connectionStatus = newStatus;

      if (newStatus === 'connected') {
        state.lastConnectedAt = new Date().toISOString();
      } else if (newStatus === 'disconnected' && previousStatus === 'connected') {
        state.lastDisconnectedAt = new Date().toISOString();
      }
    },

    aiConnectionError: (state, action) => {
      state.connectionErrors.push({
        error: action.payload,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 10 errors
      if (state.connectionErrors.length > 10) {
        state.connectionErrors = state.connectionErrors.slice(-10);
      }
    },

    clearConnectionErrors: (state) => {
      state.connectionErrors = [];
    },
  },
});

export const {
  aiConnectionStatusChanged,
  aiConnectionError,
  clearConnectionErrors,
} = aiAssistantSlice.actions;

// Selectors
export const getAIConnectionStatus = (state) =>
  state.aiAssistant?.connectionStatus || 'disconnected';

export const getAILastConnectedAt = (state) =>
  state.aiAssistant?.lastConnectedAt;

export const getAILastDisconnectedAt = (state) =>
  state.aiAssistant?.lastDisconnectedAt;

export const getAIConnectionErrors = (state) =>
  state.aiAssistant?.connectionErrors || [];

export const isAIConnected = (state) =>
  getAIConnectionStatus(state) === 'connected';

export default aiAssistantSlice.reducer;
