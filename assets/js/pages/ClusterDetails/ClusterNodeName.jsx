import React from 'react';
import {
  EOS_BOLT_FILLED,
  EOS_WARNING_OUTLINED,
  EOS_BUILD_OUTLINED,
  EOS_POWER_OFF_OUTLINED,
} from 'eos-icons-react';

import { countBy } from 'lodash';

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

const getNodeMessageAndIcon = (status, resources) => {
  const { unmanaged } = countBy(resources, (resource) =>
    resource.managed ? 'managed' : 'unmanaged'
  );
  const message = unmanaged > 0 ? `${unmanaged} resources unmanaged` : status;
  const icon = getNodeStatusIcon(status);

  return { icon, message };
};
function ClusterNodeName({ status, hostId, children, resources = [] }) {
  const { icon, message } = getNodeMessageAndIcon(status, resources);
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
