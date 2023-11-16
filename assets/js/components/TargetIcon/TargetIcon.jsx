import React from 'react';
import { EOS_COLLOCATION, EOS_DESKTOP_WINDOWS } from 'eos-icons-react';

import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';

const targetTypeToIcon = {
  [TARGET_CLUSTER]: <EOS_COLLOCATION className="fill-white" />,
  [TARGET_HOST]: <EOS_DESKTOP_WINDOWS className="fill-white" />,
};

function TargetIcon({ targetType }) {
  if (!targetType || !targetTypeToIcon[targetType]) {
    return null;
  }

  return (
    <div
      data-testid="target-icon"
      className="inline-flex bg-jungle-green-500 p-1 rounded-full self-center"
    >
      <span data-testid={`target-icon-${targetType}`}>
        {targetTypeToIcon[targetType]}
      </span>
    </div>
  );
}

export default TargetIcon;
