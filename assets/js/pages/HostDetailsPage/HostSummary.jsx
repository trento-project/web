import React from 'react';
import { chunk } from 'lodash';
import { format } from 'date-fns';
import { utc } from '@date-fns/utc';

import HealthIcon from '@common/HealthIcon';
import ListView from '@common/ListView';
import Tooltip from '@common/Tooltip';

import ClusterLink from '@pages/ClusterDetails/ClusterLink';

const prepareTooltipContent = (ipAddresses) => (
  <div className="text-center">
    {chunk(ipAddresses, 2).map((ipPairs) => (
      <div key={ipPairs.join('-')}>{ipPairs.join(', ')}</div>
    ))}
  </div>
);

const renderIpAddresses = (ipAddresses) => {
  const joinedIpAddresses = ipAddresses.join(', ');
  if (ipAddresses.length < 3) {
    return <span>{joinedIpAddresses}</span>;
  }

  return (
    <div className="flex flex-row">
      <Tooltip content={prepareTooltipContent(ipAddresses)}>
        <HealthIcon health="absent" />
      </Tooltip>
      <span className="truncate ml-1">{joinedIpAddresses}</span>
    </div>
  );
};

function HostSummary({
  agentVersion,
  arch,
  cluster,
  ipAddresses,
  lastBootTimestamp,
}) {
  const formattedLastBoot = lastBootTimestamp
    ? `${format(new Date(lastBootTimestamp), 'dd MMM yyyy, HH:mm:ss', {
        in: utc,
      })} GMT`
    : 'N/A';

  return (
    <div className="mt-4 bg-white shadow rounded-lg py-4 px-8 xl:w-2/5 mr-4">
      <ListView
        className="grid-rows-3 grid-flow-row"
        orientation="vertical"
        data={[
          {
            title: 'Architecture',
            content: arch,
          },
          {
            title: 'IP Addresses',
            render: renderIpAddresses,
            className: 'overflow-hidden overflow-ellipsis',
            content: ipAddresses,
          },
          {
            title: 'Agent Version',
            className: 'col-span-2',
            content: agentVersion,
          },
          {
            title: 'Cluster',
            content: <ClusterLink cluster={cluster} />,
          },
          {
            title: 'Last Boot',
            content: formattedLastBoot,
          },
        ]}
      />
    </div>
  );
}

export default HostSummary;
