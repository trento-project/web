import React from 'react';
import { useAIConnectionStatus } from './AssistantChatProvider';

/**
 * Connection status indicator showing online/offline state of AI Agent
 */
export function ConnectionStatusIndicator({ className = '' }) {
  const connectionStatus = useAIConnectionStatus();

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  let dotClassName = 'bg-red-500';
  if (isConnected) {
    dotClassName = 'bg-green-500';
  } else if (isConnecting) {
    dotClassName = 'bg-yellow-500 animate-pulse';
  }

  let title = 'Disconnected';
  if (isConnected) {
    title = 'Connected';
  } else if (isConnecting) {
    title = 'Connecting...';
  }

  let statusText = 'Offline';
  if (isConnected) {
    statusText = 'Online';
  } else if (isConnecting) {
    statusText = 'Connecting...';
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${dotClassName}`} title={title} />
      <span className="text-sm text-gray-600">{statusText}</span>
    </div>
  );
}
