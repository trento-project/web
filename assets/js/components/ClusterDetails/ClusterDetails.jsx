import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ListView from '@components/ListView';
import Pill from '@components/Pill';
import Table from '@components/Table';

const siteDetailsConfig = {
  columns: [
    { title: 'Hostname', key: 'name' },
    { title: 'role', key: 'hana_status' },
  ],
};

const getStatusPill = (status) =>
  status === 'healthy' ? (
    <Pill className="bg-green-200 text-green-800 mr-2">Healthy</Pill>
  ) : (
    <Pill className="bg-red-200 text-red-800 mr-2">Unhealthy</Pill>
  );

const ClusterDetails = () => {
  const { clusterID } = useParams();
  const cluster = useSelector((state) =>
    state.clustersList.clusters.find(({ id }) => id === clusterID)
  );

  if (!cluster) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex">
        <h1 className="text-3xl font-bold">
          Pacemaker cluster details: {cluster.name}
        </h1>
      </div>

      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          className="grid-rows-3"
          orientation="vertical"
          data={[
            { title: 'Cluster name', content: cluster.name },
            { title: 'SID', content: cluster.sid },
            {
              title: 'Fencing type',
              content: cluster.details && cluster.details.fencing_type,
            },
            {
              title: 'Cluster type',
              content:
                cluster.type === 'hana_scale_up' ? 'HANA scale-up' : 'Unknown',
            },
            {
              title: 'SAPHanaSR health state',
              content: cluster.details && cluster.details.sr_health_state,
            },
            {
              title: 'HANA system replication mode',
              content:
                cluster.details && cluster.details.system_replication_mode,
            },
            {
              title: 'HANA secondary sync state',
              content: cluster.details && cluster.details.secondary_sync_state,
            },
            {
              title: 'HANA system replication mode',
              content:
                cluster.details &&
                cluster.details.system_replication_operation_mode,
            },
          ]}
        />
      </div>

      {cluster.details && cluster.details.stopped_resources.length > 0 && (
        <div className="mt-16">
          <div className="flex flex-direction-row">
            <h2 className="ml-2 text-2xl font-bold self-center">
              Stopped resources
            </h2>
          </div>
          <div className="mt-2 ml-2">
            {cluster.details.stopped_resources.map(({ id }) => (
              <Pill className="bg-gray-200 text-gray-800" key={id}>
                {id}
              </Pill>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">Pacemaker Site details</h2>
        </div>
      </div>
      <div className="mt-2 ml-2">
        <h3 className="text-l font-bold">NBG</h3>
        <Table
          config={siteDetailsConfig}
          data={cluster.details.nodes.filter(({ site }) => site === 'NBG')}
        />
        <h3 className="text-l font-bold">WDF</h3>
        <Table
          config={siteDetailsConfig}
          data={cluster.details.nodes.filter(({ site }) => site === 'WDF')}
        />
      </div>

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">SBD/Fencing</h2>
        </div>
      </div>
      <div className="mt-2 ml-2 bg-white shadow rounded-lg py-4 px-8">
        {cluster.details.sbd_devices.map(({ device, status }) => (
          <div key={device}>
            {getStatusPill(status)} {device}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClusterDetails;
