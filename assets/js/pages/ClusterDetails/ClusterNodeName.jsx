import React from 'react';
import {
  EOS_BOLT_FILLED,
  EOS_WARNING_OUTLINED,
  EOS_BUILD_OUTLINED,
  EOS_POWER_OFF_OUTLINED,
} from 'eos-icons-react';

import Tooltip from '@common/Tooltip';
import ClusterNodeLink from './ClusterNodeLink';

const getNodeStatusIcon = (status, resources) => {
  const lowercasedStatus = (status || '').toLowerCase();
  switch (lowercasedStatus) {
    case 'online': {
      const unmanagedResourcesCount = resources.filter(
        ({ managed }) => !managed
      ).length;

      if (unmanagedResourcesCount > 0) {
        return {
          icon: <EOS_BUILD_OUTLINED className="tn-online" />,
          message: `${unmanagedResourcesCount} unmanaged resources`,
        };
      }

      return {
        icon: <EOS_BOLT_FILLED className="tn-online" />,
        message: status,
      };
    }
    case 'offline': {
      return {
        icon: <EOS_POWER_OFF_OUTLINED className="tn-offline" />,
        message: status,
      };
    }
    case 'maintenance': {
      return {
        icon: <EOS_BUILD_OUTLINED className="tn-maintenance" />,
        message: status,
      };
    }

    default: {
      return {
        icon: <EOS_WARNING_OUTLINED className="tn-unknown" />,
        message: status,
      };
    }
  }
};

function ClusterNodeName({ status, hostId, resources, children }) {
  const { icon, message } = getNodeStatusIcon(status, resources);
  return (
    <span className="group flex items-center relative space-x-2">
      <Tooltip content={message} place="bottom">
        {icon}
      </Tooltip>
      <ClusterNodeLink hostId={hostId}>{children}</ClusterNodeLink>
    </span>
  );
}

export default ClusterNodeName;
