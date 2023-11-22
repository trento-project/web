import React from 'react';
import { EOS_COLLOCATION, EOS_DESKTOP_WINDOWS } from 'eos-icons-react';

import { TARGET_CLUSTER, TARGET_HOST, isValidTargetType } from '@lib/model';

const targetTypeToIcon = {
  [TARGET_CLUSTER]: EOS_COLLOCATION,
  [TARGET_HOST]: EOS_DESKTOP_WINDOWS,
};

const targetTypeToLabel = {
  [TARGET_CLUSTER]: 'Clusters',
  [TARGET_HOST]: 'Hosts',
};

function TargetIcon({
  targetType,
  withLabel = false,
  labelMap = targetTypeToLabel,
  containerClassName = '',
  iconClassName = '',
}) {
  if (!isValidTargetType(targetType)) {
    return null;
  }
  const IconComponent = targetTypeToIcon[targetType];

  return (
    <>
      <span data-testid="target-icon" className={containerClassName}>
        <span data-testid={`target-icon-${targetType}`}>
          <IconComponent className={iconClassName} />
        </span>
      </span>
      {withLabel && (
        <span data-testid="target-label">{labelMap[targetType]}</span>
      )}
    </>
  );
}

export default TargetIcon;
