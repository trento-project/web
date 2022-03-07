import React from 'react';
import Table from './Table';

import { useSelector } from 'react-redux';

import { EOS_LENS_FILLED } from 'eos-icons-react';

const getHeartbeatIcon = ({ heartbeat }) => {
  switch (heartbeat) {
    case 'passing':
      return <EOS_LENS_FILLED className="fill-jungle-green-500" />;
    case 'critical':
      return <EOS_LENS_FILLED className="fill-red-500" />;
    default:
      return <EOS_LENS_FILLED className="fill-gray-500" />;
  }
};

const HostsList = () => {
  const hosts = useSelector((state) => state.hostsList.hosts);
  const config = {
    columns: [{
      title: 'Health',
      key: 'health',
    },
    {
      title: 'Hostname',
      key: 'hostname',
    },
    {
      title: 'IP',
      key: 'ip',
    },
    {
      title: 'Provider',
      key: 'provider',
    },
    {
      title: 'Agent version',
      key: 'agent_version',
    }],
  };

  let data = [];
  console.log("hosts length", hosts.length);
  hosts.map((host) => (
    console.log("host", host),
    data.push({
      health: getHeartbeatIcon(host),
      hostname: host.hostname,
      ip: host.ip_addresses.join(', '),
      provider: host.provider,
      agent_version: host.agent_version, 
    })
  ));


  return (
    <Table config={config} data={data} />
  );
};

export default HostsList;
