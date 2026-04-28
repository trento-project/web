import React from 'react';
import Spinner from '@common/Spinner';

export function StatusIndicator({ label }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground mt-2">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}
