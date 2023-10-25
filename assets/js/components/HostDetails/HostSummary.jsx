import React from 'react';
import ListView from '@components/ListView';
import HealthIcon from '@components/Health/HealthIcon';
import Tooltip from '@components/Tooltip';
import ClusterLink from '@components/ClusterLink';

import { chunk } from 'lodash';

const prepareTooltipContent = (ipAddresses) => {
  const formattedIpList = chunk(ipAddresses, 2);
  const preparedTooltipContent = formattedIpList.map((ipPair) => {
    const key = ipPair.length < 2 ? ipPair[0] : `${ipPair[0]}_${ipPair[1]}`;
    return (
      <div key={key} className="flex items-center justify-center">
        <span>{ipPair[0]}</span>
        {ipPair[1] && <span>, {ipPair[1]}</span>}
      </div>
    );
  });
  return preparedTooltipContent;
};

const renderIpAddresses = (ipAddresses) => {
  const joinedIpAddresses = ipAddresses.join(', ');
  if (ipAddresses.length < 3) {
    return <span>{joinedIpAddresses}</span>;
  }

  return (
    <div className="flex flex-row">
      <Tooltip
        className="grid grid-flow-row grid-cols-1 grid-rows-1"
        content={prepareTooltipContent(ipAddresses)}
      >
        <HealthIcon health="absent" />
      </Tooltip>
      <span className="truncate pl-1">{joinedIpAddresses}</span>
    </div>
  );
};

function HostSummary({ agentVersion, cluster, ipAddresses }) {
  return (
    <div className="mt-4 bg-white shadow rounded-lg py-4 px-8 xl:w-2/5 mr-4">
      <ListView
        className="grid-rows-3"
        orientation="vertical"
        titleClassName=""
        contentClassName="overflow-hidden overflow-ellipsis"
        data={[
          {
            title: 'Cluster',
            content: <ClusterLink cluster={cluster} />,
          },
          { title: 'Agent Version', content: agentVersion },
          {
            title: 'IP addresses',
            render: renderIpAddresses,
            content: ipAddresses,
          },
        ]}
      />
    </div>
  );
}

export default HostSummary;
