import React from 'react';
import {
  EOS_BOLT_FILLED,
  EOS_WARNING_OUTLINED,
  EOS_BUILD_OUTLINED,
  EOS_POWER_OFF_OUTLINED,
} from 'eos-icons-react';

import { filter } from 'lodash';

import Tooltip from '@common/Tooltip';
import ClusterNodeLink from './ClusterNodeLink';

const statusIcons = {
  Online: <EOS_BOLT_FILLED className="tn-online" />,
  Offline: <EOS_POWER_OFF_OUTLINED className="tn-offline" />,
  Maintenance: <EOS_BUILD_OUTLINED className="tn-maintenance" />,
  Default: <EOS_WARNING_OUTLINED className="tn-unknown" />,
};

const getNodeStatusIconAndMessage = (status, resources) => {
  const unmanagedResources = filter(resources, { managed: false }).length;
  const message =
    unmanagedResources > 0
      ? `${unmanagedResources} resources unmanaged`
      : status;
  const icon = statusIcons[status] || statusIcons.Default;

  return { icon, message };
};
function ClusterNodeName({ status, hostId, children, resources = [] }) {
  const { icon, message } = getNodeStatusIconAndMessage(status, resources);
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
