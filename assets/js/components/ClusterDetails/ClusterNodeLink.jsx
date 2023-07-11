import React from 'react';
import { EOS_WARNING_OUTLINED } from 'eos-icons-react';

import Tooltip from '@components/Tooltip';
import HostLink from '@components/HostLink';

function ClusterNodeLink({ name, hostId }) {
  if (hostId) {
    return <HostLink hostId={hostId}>{name}</HostLink>;
  }
  return (
    <span className="group flex items-center relative">
      <EOS_WARNING_OUTLINED size="base" className="centered fill-yellow-500" />
      <span className="ml-1 truncate max-w-[100px]">{name}</span>
      <Tooltip
        tooltipText="Host currently not registered."
        width="w-52 -translate-x-1/3"
      />
    </span>
  );
}

export default ClusterNodeLink;
