import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ListView from '@components/ListView';
import Table from '@components/Table';

import HeartbeatPill from './HeartbeatPill';

import {
  subscriptionsTableConfiguration,
  sapInstancesTableConfiguration,
} from './tableConfigs';

import SuseLogo from '../../../static/suse_logo.svg';
import { isIdByKey } from '@state/selectors';

const HostDetails = () => {
  const { hostID } = useParams();
  const host = useSelector((state) =>
    state.hostsList.hosts.find(isIdByKey('id', hostID))
  );

  const sapSystems = useSelector((state) => {
    return state.sapSystemsList.sapSystems
      .reduce((accumulator, current) => {
        const foundInApplicationInstances = current.application_instances?.find(
          isIdByKey('host_id', hostID)
        );
        const foundInDatabaseInstances = current.database_instances?.find(
          isIdByKey('host_id', hostID)
        );
        return [
          ...accumulator,
          foundInApplicationInstances && {
            ...foundInApplicationInstances,
            type: 'application',
          },
          foundInDatabaseInstances && {
            ...foundInDatabaseInstances,
            type: 'database',
          },
        ];
      }, [])
      .filter((elem) => elem !== undefined);
  });

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
            { title: 'Cluster', content: host.cluster && host.cluster.name },
            { title: 'Agent version', content: host.agent_version },
          ]}
        />
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
              { title: 'VM Size', content: host.provider_data?.vm_name },
              { title: 'VM Name', content: host.provider_data?.vm_name },
              {
                title: 'Data disk number',
                content: host.provider_data?.data_disk_number,
              },
              {
                title: 'Resource group',
                content: host.provider_data?.location,
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
