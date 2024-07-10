import React from 'react';
import { get } from 'lodash';

import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';

import ClusterInfoBox from '@common/ClusterInfoBox';
import HostInfoBox from '@common/HostInfoBox';

function TargetInfoBox({ targetType, target }) {
  const architectureType = get(target, 'details.architecture_type');

  switch (targetType) {
    case TARGET_CLUSTER:
      return (
        <ClusterInfoBox
          haScenario={target.type}
          provider={target.provider}
          architectureType={architectureType}
        />
      );
    case TARGET_HOST:
      return (
        <HostInfoBox
          provider={target.provider}
          agentVersion={target.agent_version}
        />
      );
    default:
      return null;
  }
}

export default TargetInfoBox;
