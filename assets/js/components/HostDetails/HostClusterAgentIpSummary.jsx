import React from 'react';
import ListView from '@components/ListView';
import HealthIcon from '@components/Health/HealthIcon';
import Tooltip from '@components/Tooltip';
import ClusterLink from '@components/ClusterLink';

function HostClusterAgentIpSummary({ cluster, agentVersion, ipAddresses }) {

  const renderTooltipContent = (ipList) =>
  ipList.reduce((ipPair, ip, index) => {
    if (index % 2 === 0) {
      const nextIp = ipList[index + 1];
      const key = `${index}_${ip}`;
      ipPair.push(
        <div key={key} className="flex items-center justify-center">
          <span>{ip}</span>
          {nextIp && <span>, {nextIp}</span>}
        </div>
      );
    }
    return ipPair;
  }, []);


  const renderIpList = (ipList) => {
    const fullIpList= ipList.join(',')
    if (ipList.length < 4) {
      return fullIpList;
    }

    return (
      <div className="flex flex-row">
        <Tooltip
          className="grid grid-flow-row grid-cols-1 grid-rows-1"
          content={renderTooltipContent(ipList)}
        >
          <HealthIcon health="absent" />
        </Tooltip>
        <span className="overflow-hidden overflow-ellipsis">
          {fullIpList}
        </span>
      </div>
    );
  };

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
          { title: 'IP addresses', content: renderIpList(ipAddresses) },
        ]}
      />
    </div>
  );
}

export default HostClusterAgentIpSummary;
