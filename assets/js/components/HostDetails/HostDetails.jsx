import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ListView from '@components/ListView';
import Table from '@components/Table';

import {
  SubscriptionsTableConfiguration,
  SapInstancesTableConfiguration,
} from './tableConfigs';

const isIdByKey =
  (key, id) =>
  ({ [key]: keyToLookup }) =>
    keyToLookup === id;

const HostDetails = () => {
  const { hostID } = useParams();
  const host = useSelector((state) =>
    state.hostsList.hosts.find(isIdByKey('id', hostID))
  );

  const sapSystems = useSelector((state) => {
    return state.sapSystemsList.sapSystems
      .reduce((accumulator, current) => {
        const foundInApplicationInstances = current.application_instances.find(
          isIdByKey('host_id', hostID)
        );
        const foundInDatabaseInstances = current.database_instances.find(
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
      <div>
        <h1 className="text-3xl font-bold">Host details: {host.hostname}</h1>
      </div>

      <div className="mt-4">
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
            { title: 'VM Size', content: host.provider_data.vm_name },
            { title: 'VM Name', content: host.provider_data.vm_name },
            {
              title: 'Data disk number',
              content: host.provider_data.data_disk_number,
            },
            { title: 'Resource group', content: host.provider_data.location },
            { title: 'Offer', content: host.provider_data.offer },
            { title: 'Location', content: host.provider_data.location },
            { title: 'SKU', content: host.provider_data.sku },
          ]}
        />
      </div>

      <div className="mt-16">
        <div>
          <h2 className="text-2xl font-bold">SLES subscription details</h2>
        </div>
        <Table
          config={SubscriptionsTableConfiguration}
          data={host.sles_subscriptions}
        />
      </div>

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">SAP instances</h2>
        </div>
        <Table config={SapInstancesTableConfiguration} data={sapSystems} />
      </div>
    </div>
  );
};

export default HostDetails;
