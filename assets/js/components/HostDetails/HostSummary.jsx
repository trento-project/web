import React from 'react';
import ListView from '@components/ListView';
import HealthIcon from '@components/Health/HealthIcon';
import Tooltip from '@components/Tooltip';
import ClusterLink from '@components/ClusterLink';

const prepareTooltipContent = (ipAddresses) => (
  <div className="grid grid-cols-2 gap-1">
    {ipAddresses.map((ip, index) => (
      <div key={ip}>
        {ip}
        {index % 2 === 0 && ipAddresses.length - 1 !== index && ' '}
      </div>
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
