// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import classNames from 'classnames';
import { get, some } from 'lodash';

import { DATABASE_TYPE } from '@lib/model/sapSystems';
import { STALE_ROW } from '@lib/tables';

import CleanUpButton from '@common/CleanUpButton';
import HostLink from '@common/HostLink';
import Pill from '@common/Pill';

import ClusterLink from '@pages/ClusterDetails/ClusterLink';
import { Features, InstanceStatus } from '@pages/SapSystemDetails';

export const getReplicationStatusClasses = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'ERROR':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-200 text-gray-500';
  }
};

function InstanceOverview({
  instanceType,
  instance,
  instance: {
    sid,
    status,
    system_replication: systemReplication,
    system_replication_status: systemReplicationStatus,
    instance_number: instanceNumber,
    features,
    host_id: hostID,
    host,
    absent_at: absentAt,
    stale_at: staleAt,
    deregistering,
  },
  userAbilities,
  userTimezone,
  cleanUpPermittedFor,
  onCleanUpClick,
}) {
  const hostname = get(host, 'hostname', '');
  const cluster = get(host, 'cluster', null);
  const sapInstances = get(host, 'cluster.sap_instances', []);

  const isDatabase = DATABASE_TYPE === instanceType;
  const rowClasses = classNames(
    { [STALE_ROW]: absentAt || staleAt },
    'table-row border-b'
  );

  return (
    <div className={rowClasses}>
      <div className="table-cell p-2 pl-3 align-middle">
        <InstanceStatus
          status={status}
          absent={!!absentAt}
          staleAt={staleAt}
          timezone={userTimezone}
        />
      </div>
      <div className={'table-cell p-2 text-center'}>{instanceNumber}</div>
      <div className="table-cell p-2 text-gray-500 dark:text-gray-300 text-sm">
        <Features features={features} />
      </div>
      {isDatabase && (
        <div className={'table-cell p-2'}>
          {systemReplication && `HANA ${systemReplication}`}{' '}
          {systemReplicationStatus && (
            <Pill
              className={getReplicationStatusClasses(systemReplicationStatus)}
            >
              {systemReplicationStatus}
            </Pill>
          )}
        </div>
      )}
      <div className="table-cell p-2">
        {some(sapInstances, { sid, instance_number: instanceNumber }) ? (
          <ClusterLink cluster={cluster} />
        ) : (
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            not available
          </p>
        )}
      </div>
      <div className="table-cell p-2">
        <HostLink hostId={hostID}>{hostname}</HostLink>
      </div>
      <div className="table-cell p-2">
        {absentAt && (
          <CleanUpButton
            size="fit"
            type="transparent"
            className="jungle-green-500 border-none shadow-none"
            cleaning={deregistering}
            userAbilities={userAbilities}
            permittedFor={cleanUpPermittedFor}
            onClick={() => onCleanUpClick(instance, instanceType)}
          />
        )}
      </div>
    </div>
  );
}

export default InstanceOverview;
