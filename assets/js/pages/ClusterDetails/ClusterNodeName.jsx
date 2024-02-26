import React from 'react';
import {
  EOS_BOLT_FILLED,
  EOS_WARNING_OUTLINED,
  EOS_BUILD_OUTLINED,
  EOS_POWER_OFF_OUTLINED,
} from 'eos-icons-react';

import Tooltip from '@common/Tooltip';
import ClusterNodeLink from './ClusterNodeLink';

const getNodeStatusIcon = (status) => {
  switch (status) {
    case 'Online': {
      return <EOS_BOLT_FILLED className="tn-online" />;
    }
    case 'Offline': {
      return <EOS_POWER_OFF_OUTLINED className="tn-offline" />;
    }
    case 'Maintenance': {
      return <EOS_BUILD_OUTLINED className="tn-maintenance" />;
    }
    default: {
      return <EOS_WARNING_OUTLINED className="tn-unknown" />;
    }
  }
};

const countUnmanagedResources = (resources) => {
  const unmanagedResourceNumber = resources.reduce(
    (counts, { managed }) => ({
      ...counts,
      unmanaged: managed ? counts.unmanaged : counts.unmanaged + 1,
    }),
    { unmanaged: 0 }
  );
  return unmanagedResourceNumber;
};

function ClusterNodeName({ status, hostId, children, resources = [] }) {
  const unmanagdResourcesNumber = countUnmanagedResources(resources);
  const unmanagedResourcesText = `${unmanagdResourcesNumber} resources unmanaged`;
  const toolTipText =
    unmanagdResourcesNumber > 0 && status === 'Maintenance'
      ? unmanagedResourcesText
      : status;

  return (
    <span className="group flex items-center relative space-x-2">
      <Tooltip content={toolTipText} place="bottom">
        {getNodeStatusIcon(status)}
      </Tooltip>
      <ClusterNodeLink hostId={hostId}>{children}</ClusterNodeLink>
    </span>
  );
}

export default ClusterNodeName;
