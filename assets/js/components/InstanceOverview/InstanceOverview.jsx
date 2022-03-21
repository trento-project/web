import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCluster, getHost } from '../../state/selectors';
import HealthIcon from '../Health';
import Pill from '../Pill/Pill';

const DatabaseType = 'database';

const InstanceOverview = ({
  instanceType,
  instance: {
    health,
    systemReplication,
    instance_number: instanceNumber,
    features,
    host_id: hostId,
  },
}) => {
  const isDatabase = DatabaseType === instanceType;

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
        {features.split('|').map((feature, index) => (
          <Pill key={index}>{feature}</Pill>
        ))}
      </div>
      {isDatabase && <div className="table-cell p-2">{systemReplication}</div>}
      <div className="table-cell p-2">
        {cluster ? (
          cluster.name
        ) : (
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            not available
          </p>
        )}
      </div>
      <div className="table-cell p-2">
        <Link
          className="ml-auto hidden md:block text-sm text-gray-500 dark:text-gray-300 underline"
          to={`/hosts/${hostId}`}
        >
          {host && host.hostname}
        </Link>
      </div>
    </div>
  );
};

export default InstanceOverview;
