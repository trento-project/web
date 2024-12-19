import React from 'react';
import { get } from 'lodash';

import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';

import ClusterInfoBox from '@common/ClusterInfoBox';
import HostInfoBox from '@common/HostInfoBox';

function TargetInfoBox({ targetType, target }) {
  const architectureType = get(target, 'details.architecture_type');
  const hanaScaleUpScenario = get(target, 'details.hana_scenario');
  switch (targetType) {
    case TARGET_CLUSTER:
      return (
        <ClusterInfoBox
          clusterType={target.type}
          provider={target.provider}
          scaleUpScenario={hanaScaleUpScenario}
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
