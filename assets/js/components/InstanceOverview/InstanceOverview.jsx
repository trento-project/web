import React from 'react';
import classNames from 'classnames';
import HealthIcon from '@components/Health';
import { Features } from '@components/SapSystemDetails';
import { DATABASE_TYPE } from '@lib/model';
import HostLink from '@components/HostLink';
import ClusterLink from '@components/ClusterLink';
import Pill from '@components/Pill';
import CleanUpButton from '@components/CleanUpButton';
import Tooltip from '@components/Tooltip';

function InstanceOverview({
  instanceType,
  instance: {
    health,
    system_replication: systemReplication,
    system_replication_status: systemReplicationStatus,
    instance_number: instanceNumber,
    features,
    host_id: hostID,
    host,
    absent_at: absentAt,
  },
}) {
  const isDatabase = DATABASE_TYPE === instanceType;
  const rowClasses = classNames(
    { 'bg-gray-100': absentAt },
    'table-row border-b'
  );
  return (
    <div className={rowClasses}>
      <div className="table-cell p-2 px-5">
        {absentAt ? (
          <Tooltip content="Instance currently not registered." place="bottom">
            <span
              data-testid="absent-tooltip"
              className="group flex items-center relative"
            >
              <HealthIcon health="absent" centered />
              <span className="ml-1 truncate max-w-[100px]" />
            </span>
          </Tooltip>
        ) : (
          <HealthIcon health={health} />
        )}
      </div>
      <div className="table-cell p-2 text-center">{instanceNumber}</div>
      <div className="table-cell p-2 text-gray-500 dark:text-gray-300 text-sm">
        <Features features={features} />
      </div>
      {isDatabase && (
        <div className="table-cell p-2">
          {systemReplication && `HANA ${systemReplication}`}{' '}
          {systemReplicationStatus && <Pill>{systemReplicationStatus}</Pill>}
        </div>
      )}
      <div className="table-cell p-2">
        {host?.cluster ? (
          <ClusterLink cluster={host.cluster} />
        ) : (
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            not available
          </p>
        )}
      </div>
      <div className="table-cell p-2">
        <HostLink hostId={hostID}>{host && host.hostname}</HostLink>
      </div>
      {absentAt && (
        <div className="table-cell p-2">
          <CleanUpButton size="fit" type="default-gray-100" />
        </div>
      )}
    </div>
  );
}

export default InstanceOverview;
