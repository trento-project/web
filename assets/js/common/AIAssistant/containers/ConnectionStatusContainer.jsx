import React from 'react';

import { useAIConnectionStatus } from '../AssistantChatProvider';
import { ConnectionStatusIndicator } from '../components/ConnectionStatusIndicator';

export function ConnectionStatusContainer({ className }) {
  const status = useAIConnectionStatus();
  return <ConnectionStatusIndicator status={status} className={className} />;
}
