import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCluster, getHost } from '@state/selectors';
import HealthIcon from '@components/Health';
import { Features } from '@components/SapSystemDetails';
import { DATABASE_TYPE } from '@lib/model';
import ClusterLink from '@components/ClusterLink';
import Pill from '@components/Pill';
const InstanceOverview = ({
  instanceType,
  instance: {
    health,
    system_replication: systemReplication,
    system_replication_status: systemReplicationStatus,
    instance_number: instanceNumber,
    features,
    host_id: hostId,
  },
}) => {
  const isDatabase = DATABASE_TYPE === instanceType;

  const host = useSelector(getHost(hostId));
  const cluster = useSelector(getCluster(host?.cluster_id));

  return (
    <div className="table-row border-b">
      <div className="table-cell p-2">
        <HealthIcon health={health} />
      </div>
      <div className="table-cell p-2 text-center">{instanceNumber}</div>
      <div
        className={`table-cell p-2 text-gray-500 dark:text-gray-300 text-sm`}
      >
        <Features features={features} />
      </div>
      {isDatabase && (
        <div className="table-cell p-2">
          {systemReplication && `HANA ${systemReplication}`}{' '}
          {systemReplicationStatus && <Pill>{systemReplicationStatus}</Pill>}
        </div>
      )}
      <div className="table-cell p-2">
        {cluster ? (
          <ClusterLink cluster={cluster} />
        ) : (
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            not available
          </p>
        )}
      </div>
      <div className="table-cell p-2">
        <Link
          className="text-jungle-green-500 hover:opacity-75"
          to={`/hosts/${hostId}`}
        >
          {host && host.hostname}
        </Link>
      </div>
    </div>
  );
};

export default InstanceOverview;
