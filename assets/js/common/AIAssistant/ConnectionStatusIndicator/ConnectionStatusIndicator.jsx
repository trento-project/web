import React from 'react';

const STATUS_LABELS = {
  connected: { title: 'Connected', text: 'Online', dot: 'bg-green-500' },
  connecting: {
    title: 'Connecting...',
    text: 'Connecting...',
    dot: 'bg-yellow-500 animate-pulse',
  },
  disconnected: { title: 'Disconnected', text: 'Offline', dot: 'bg-red-500' },
};

export function ConnectionStatusIndicator({ status, className = '' }) {
  const { title, text, dot } =
    STATUS_LABELS[status] ?? STATUS_LABELS.disconnected;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${dot}`} title={title} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}
