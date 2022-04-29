import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ListView from '@components/ListView';
import Table from '@components/Table';

import HeartbeatPill from './HeartbeatPill';

import ClusterLink from '@components/ClusterLink';

import {
  subscriptionsTableConfiguration,
  sapInstancesTableConfiguration,
} from './tableConfigs';

import SuseLogo from '../../../static/suse_logo.svg';
import {
  getInstancesOnHost,
  getClusterByHost,
  getHost,
} from '@state/selectors';

const HostDetails = () => {
  const { hostID } = useParams();
  const host = useSelector(getHost(hostID));
  const cluster = useSelector(getClusterByHost(hostID));
  const sapSystems = useSelector(getInstancesOnHost(hostID));

  // eslint-disable-next-line no-undef
  const { grafanaPublicUrl } = config;

  if (!host) {
    return <div>Not Found</div>;
  }

  return (
    <div>
      <div className="flex">
        <h1 className="text-3xl font-bold">Host details: {host.hostname}</h1>
        <HeartbeatPill
          className="self-center ml-4 shadow"
          heartbeat={host.heartbeat}
        />
      </div>
      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          orientation="vertical"
          data={[
            { title: 'Name', content: host.hostname },
            {
              title: 'Cluster',
              content: (
                <ClusterLink cluster={cluster}>{cluster?.name}</ClusterLink>
              ),
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
        ></iframe>
      </div>
      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <iframe
          src={`${grafanaPublicUrl}/d-solo/rYdddlPWj/node-exporter-full?orgId=1&refresh=1m&theme=light&panelId=78&var-agentID=${host.id}`}
          width="100%"
          height="200"
          frameBorder="0"
        ></iframe>
      </div>

      <div className="mt-16">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Cloud details</h2>
        </div>
        <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
          <ListView
            className="grid-rows-2"
            orientation="vertical"
            rows={2}
            data={[
              {
                title: 'Provider',
                content: host.provider,
                render: (content) => <p className="capitalize">{content}</p>,
              },
              { title: 'VM Size', content: host.provider_data?.vm_size },
              { title: 'VM Name', content: host.provider_data?.vm_name },
              {
                title: 'Data disk number',
                content: host.provider_data?.data_disk_number,
              },
              {
                title: 'Resource group',
                content: host.provider_data?.resource_group,
              },
              { title: 'Offer', content: host.provider_data?.offer },
              { title: 'Location', content: host.provider_data?.location },
              { title: 'SKU', content: host.provider_data?.sku },
            ]}
          />
        </div>
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

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">SAP instances</h2>
        </div>
        <Table config={sapInstancesTableConfiguration} data={sapSystems} />
      </div>
    </div>
  );
};

export default HostDetails;
