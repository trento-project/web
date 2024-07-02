import React from 'react';
import classNames from 'classnames';

import { DATABASE_TYPE } from '@lib/model/sapSystems';

import CleanUpButton from '@common/CleanUpButton';
import HealthIcon from '@common/HealthIcon';
import HostLink from '@common/HostLink';
import Pill from '@common/Pill';
import Tooltip from '@common/Tooltip';

import ClusterLink from '@pages/ClusterDetails/ClusterLink';
import { Features } from '@pages/SapSystemDetails';

function InstanceOverview({
  instanceType,
  instance,
  instance: {
    health,
    system_replication: systemReplication,
    system_replication_status: systemReplicationStatus,
    instance_number: instanceNumber,
    features,
    host_id: hostID,
    host,
    absent_at: absentAt,
    deregistering,
  },
  userAbilities,
  cleanUpPermittedFor,
  onCleanUpClick,
}) {
  const isDatabase = DATABASE_TYPE === instanceType;
  const rowClasses = classNames(
    { 'bg-gray-100': absentAt },
    'table-row border-b'
  );

  const textColor = classNames({ 'text-gray-500': absentAt });
  return (
    <div className={rowClasses}>
      <div className="table-cell p-2 px-5 align-center">
        <Tooltip
          content="Registered instance not found."
          place="bottom"
          isEnabled={!!absentAt}
        >
          <HealthIcon health={absentAt ? 'absent' : health} />
        </Tooltip>
      </div>
      <div className={classNames(textColor, 'table-cell p-2 text-center')}>
        {instanceNumber}
      </div>
      <div className="table-cell p-2 text-gray-500 dark:text-gray-300 text-sm">
        <Features features={features} />
      </div>
      {isDatabase && (
        <div className={classNames(textColor, 'table-cell p-2')}>
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
          <CleanUpButton
            size="fit"
            type="transparent"
            className="jungle-green-500 border-none shadow-none"
            cleaning={deregistering}
            userAbilities={userAbilities}
            permittedFor={cleanUpPermittedFor}
            onClick={() => onCleanUpClick(instance, instanceType)}
          />
        </div>
      )}
    </div>
  );
}

export default InstanceOverview;
