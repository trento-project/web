import React from 'react';
import { EOS_WARNING_OUTLINED } from 'eos-icons-react';

import Tooltip from '@components/Tooltip';
import HostLink from '@components/HostLink';

function ClusterNodeLink({ hostId, children }) {
  if (hostId) {
    return <HostLink hostId={hostId}>{children}</HostLink>;
  }
  return (
    <Tooltip content="Host currently not registered." place="bottom">
      <span className="group flex items-center relative">
        <EOS_WARNING_OUTLINED
          size="base"
          className="centered fill-yellow-500"
        />
        <span className="ml-1 truncate max-w-[100px]">{children}</span>
      </span>
    </Tooltip>
  );
}

export default ClusterNodeLink;
