import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import axios from 'axios';

import ListView from '@components/ListView';
import Table from '@components/Table';

import ClusterLink from '@components/ClusterLink';
import SuseLogo from '@static/suse_logo.svg';
import {
  getInstancesOnHost,
  getClusterByHost,
  getHost,
} from '@state/selectors';
import StatusPill from './StatusPill';
import ProviderDetails from './ProviderDetails';

import {
  subscriptionsTableConfiguration,
  sapInstancesTableConfiguration,
} from './tableConfigs';

function HostDetails() {
  const { hostID } = useParams();
  const host = useSelector(getHost(hostID));
  const cluster = useSelector(getClusterByHost(hostID));
  const sapSystems = useSelector(getInstancesOnHost(hostID));

  // eslint-disable-next-line no-undef
  const { grafanaPublicUrl } = config;

  const [exportersStatus, setExportersStatus] = useState([]);

  const getExportersStatus = async () => {
    const { data } = await axios.get(`/api/hosts/${hostID}/exporters_status`);
    setExportersStatus(data);
  };

  useEffect(() => {
    getExportersStatus();
  }, []);

  if (!host) {
    return <div>Not Found</div>;
  }

  return (
    <div>
      <div className="flex">
        <h1 className="text-3xl font-bold">
          Host details:
          {host.hostname}
        </h1>
        <StatusPill
          className="self-center ml-4 shadow"
          heartbeat={host.heartbeat}
        >
          Agent
        </StatusPill>

        {Object.entries(exportersStatus).map(
          ([exporterName, exporterStatus]) => (
            <StatusPill
              key={exporterName}
              className="self-center ml-4 shadow"
              heartbeat={exporterStatus}
            >
              {exporterName}
            </StatusPill>
          ),
        )}
      </div>
      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          orientation="vertical"
          data={[
            { title: 'Name', content: host.hostname },
            {
              title: 'Cluster',
              content: <ClusterLink cluster={cluster} />,
            },
            { title: 'Agent version', content: host.agent_version },
          ]}
        />
      </div>

      <div className="mt-8 bg-white shadow rounded-lg py-4 px-8">
        <iframe
          src={`${grafanaPublicUrl}/d-solo/rYdddlPWj/node-exporter-full?orgId=1&refresh=1m&theme=light&panelId=77&var-agentID=${host.id}`}
          width="100%"
          height="200"
          frameBorder="0"
        />
      </div>
      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <iframe
          src={`${grafanaPublicUrl}/d-solo/rYdddlPWj/node-exporter-full?orgId=1&refresh=1m&theme=light&panelId=78&var-agentID=${host.id}`}
          width="100%"
          height="200"
          frameBorder="0"
        />
      </div>

      <div className="mt-16">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Provider details</h2>
        </div>
        <ProviderDetails
          provider={host.provider}
          provider_data={host.provider_data}
        />
      </div>

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">SAP instances</h2>
        </div>
        <Table config={sapInstancesTableConfiguration} data={sapSystems} />
      </div>

      <div className="mt-16">
        <div className="flex flex-direction-row">
          <img src={SuseLogo} className="h-12" />
          <h2 className="ml-2 text-2xl font-bold self-center">
            SLES subscription details
          </h2>
        </div>
        <Table
          config={subscriptionsTableConfiguration}
          data={host.sles_subscriptions}
        />
      </div>
    </div>
  );
}

export default HostDetails;
