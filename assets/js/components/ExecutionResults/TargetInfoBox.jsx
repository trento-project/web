import React from 'react';

import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';

import { ClusterInfoBox } from '@components/ClusterDetails';
import HostInfoBox from '@components/HostDetails/HostInfoBox';

function TargetInfoBox({ targetType, target }) {
  switch (targetType) {
    case TARGET_CLUSTER:
      return (
        <ClusterInfoBox haScenario={target.type} provider={target.provider} />
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
