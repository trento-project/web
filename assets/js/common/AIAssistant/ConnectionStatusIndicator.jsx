import React from 'react';
import { useAIConnectionStatus } from './AssistantChatProvider';

/**
 * Connection status indicator showing online/offline state of AI Agent
 */
export function ConnectionStatusIndicator({ className = '' }) {
  const connectionStatus = useAIConnectionStatus();

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`h-2 w-2 rounded-full ${
          isConnected
            ? 'bg-green-500'
            : isConnecting
            ? 'bg-yellow-500 animate-pulse'
            : 'bg-red-500'
        }`}
        title={
          isConnected
            ? 'Connected'
            : isConnecting
            ? 'Connecting...'
            : 'Disconnected'
        }
      />
      <span className="text-sm text-gray-600">
        {isConnected
          ? 'Online'
          : isConnecting
          ? 'Connecting...'
          : 'Offline'}
      </span>
    </div>
  );
}
